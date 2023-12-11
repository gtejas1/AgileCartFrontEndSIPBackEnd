require("dotenv").config();
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const orderRoutes = require("./routes/order");
const paymentBRoutes = require("./routes/paymentBRoutes");
const stripeRoutes = require("./routes/stripepayment");

const app = express();

//updated connection string
mongoose
  .connect(
    "mongodb+srv://cdCENTIXO:gw2ksoft@cluster0.6vkmg.mongodb.net/tshirts?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("DB CONNECTED!");
  });

// app.use((req, res, next) => {
//   mongoose
//     .connect(
//       "mongodb+srv://cdCENTIXO:gw2ksoft@cluster0.6vkmg.mongodb.net/tshirts?retryWrites=true&w=majority",
//       {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         useCreateIndex: true,
//       }
//     )
//     .then(() => {
//       console.log("DB CONNECTED!");
//       next();
//     });
// });

app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

//My routes
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", paymentBRoutes);
app.use("/api", stripeRoutes);

const port = process.env.PORT || 8000;

// module.exports.handler = serverless(app);
app.listen(port, () => {
  console.log(`app is running at ${port}`);
});
