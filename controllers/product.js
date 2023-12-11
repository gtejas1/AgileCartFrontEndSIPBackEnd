const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { parseInt, sortBy } = require("lodash");
const AWS = require("aws-sdk");
const uuid = require("uuid/v4");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.AWS_SECRET,
});

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found in DB",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }
    //destructure the fields
    const { name, price, description, category, stock } = fields;

    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    //TODO:restrictions on field

    //handle file here
    // if (file.photo) {
    //   if (file.photo.size > 3000000) {
    //     return res.status(400).json({
    //       error: "File size too big!",
    //     });
    //   }
    //   data = fs.readFileSync(file.photo.path);
    //   contentType = "jpeg";
    // }
    const data = fs.readFileSync(file.photo.path);
    const contentType = "jpg";

    //upload to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${uuid()}.${contentType}`,
      Body: data,
    };
    var photoURL;
    s3.upload(params, (error, data) => {
      if (error) {
        res.status(500).send(error);
      }

      //res.status(200).send(data);
      //console.log(data);
      //console.log(data.Location);
      photoURL = data.Location;

      // product.photo = photoURL;
      let product = new Product({
        name: name,
        description: description,
        price: price,
        category: category,
        stock: stock,
        photo: data.Location,
      });
      //save to the DB
      product.save((err, product) => {
        if (err) {
          return res.status(400).json({
            error: "Failed to save tshirt in DB",
          });
        }
        res.json(product);
      });
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware
exports.photo = (req, res, next) => {
  if (req.product.photo) {
    return res.send(req.product.photo);
  }
  next();
};

exports.deleteProduct = (req, res) => {
  let product = req.product;
  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete product",
      });
    }
    res.json({
      message: "Successfully deleted product",
      deletedProduct,
    });
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "problem with image",
      });
    }

    //updation code
    let product = req.product;
    product = _.extend(product, fields);

    //handle file here
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //save to the DB
    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "Failed to update tshirt in DB",
        });
      }
      res.json(product);
    });
  });
};

//product listing
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 20;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  try {
    Product.find()
      .populate("category")
      .sort([[sortBy, "asc"]])
      .limit(limit)
      .exec((err, products) => {
        if (err) {
          error: "No product found";
        }
        res.json(products);
      });
  } catch (err) {
    console.log(err);
  }
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      res.status(400).json({
        error: "No category found",
      });
    }
    res.json(category);
  });
};

exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk operations failed",
      });
    }
    next();
  });
};
