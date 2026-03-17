const Product = require("../../models/product");

class adminController {
  async addProduct(req, res) {
    const product = await Product.create({
      title: req.body.title,
      price: req.body.price,
      imageUrl: req.body.imageUrl,
      description: req.body.description,
      userId: req.user.id
    });
    res.status(201).json({
      message: "Product added successfully",
      product: product.id,
    });
  } 

  async getAllProducts(req, res) {
    const products = await Product.findAll();
    console.log(products);
    res.status(201).json({
      products: products,
    });
  }

  async getProductById(req, res) {
    const product = await Product.findOne({ where: { id: req.params.id } });
    console.log(product);
    res.status(201).json({
      product: product,
    });
  }

  async updateProduct(req, res) {
    const product = await Product.update(
      {
        title: req.body.title,
        price: req.body.price,
        imageUrl: req.body.imageUrl,
        description: req.body.description,
      },
      { where: { id: req.params.id } }
    );
    console.log(product);
    res.status(201).json({
      message: "Product updated successfully",
      product: product,
    });
  }

  async deleteProduct(req, res) {
    const product = await Product.destroy({ where: { id: req.params.id } });
    console.log(product);
    res.status(201).json({
      message: "Product deleted successfully",
      product: product,
    });
  }
}

module.exports = new adminController();