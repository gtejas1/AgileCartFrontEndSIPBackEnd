const express = require("express");
const router = express.Router();

const {
  getProductById,
  getProduct,
  createProduct,
  photo,
  deleteProduct,
  updateProduct,
  getAllProducts,
  getAllUniqueCategories,
} = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//params
router.param("userId", getUserById);
router.param("productId", getProductById);

//create routes
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

//read routes
router.get("/product/:productId", getProduct);
router.get("/product/photo/:productId", photo);

//delete
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  deleteProduct
);

//update
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

//listing
router.get("/products", getAllProducts);
router.get("/products/categories", getAllUniqueCategories);

module.exports = router;

// DATABASE=mongodb://localhost:27017/tshirt
