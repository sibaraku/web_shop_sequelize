const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const productAdminRoutes = require("./routes/admin/products");
app.use("/admin", productAdminRoutes);

const productRoutes = require("./routes/products");
app.use(productRoutes);

const sequelize = require('./util/db');
const models = require("./models/index");
sequelize.models = models;

sequelize
    .sync()
  .then(() => {
    console.log("Tabelid loodud");
    app.listen(3002, () => {
      console.log("server is running on http://localhost:3002");
    });
  })
  .catch((error) => console.error("Error connecting to database", error));

app.get("/", (req, res) => {
  res.send({ message: "web shop app" });
});