const Product = require("../models/product");
const CartItem = require("../models/cart-item");
const Cart = require("../models/cart");

class shopController {
  async getAllProducts(req, res) {
    const products = await Product.findAll();
    console.log(products);
    res.status(201).json({
      products: products,
    });
  }

  async getCart(req, res) {
    const userCart = await req.user.getCart();
    console.log(userCart);
    const cartProducts = await userCart.getProducts({
      joinTableAttributes: ['id', 'quantity', 'createdAt', 'updatedAt']
    });
    res.status(201).json({
      products: cartProducts,
    });
  }

  async createCart(req, res) {
    try {
      const userCart = await req.user.getCart();
      if (!userCart) {
        return res.status(404).json({ message: "Cart not found for user." });
      }

      const product = await Product.findByPk(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Product not found." });
      }

      const quantity = parseInt(req.body.quantity, 10);
      const safeQuantity = !isNaN(quantity) && quantity > 0 ? quantity : 1;

      const cartItem = await CartItem.findOne({
        where: {
          cartId: userCart.id,
          productId: product.id,
        },
      });

      if (cartItem) {
        const currentQty = cartItem.quantity || 1;
        cartItem.quantity = currentQty + safeQuantity;
        await cartItem.save();
      } else {
        await CartItem.create({
          cartId: userCart.id,
          productId: product.id,
          quantity: safeQuantity,
        });
      }

      const cartProducts = await userCart.getProducts({
        joinTableAttributes: ['id', 'quantity', 'createdAt', 'updatedAt']
      });
      res.status(201).json({ products: cartProducts });
    } catch (err) {
      console.error("Error in createCart:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async deleteCart(req, res) {
    const userCart = await req.user.getCart();
    if (!userCart) {
      return res.status(404).json({ message: "Cart not found for user." });
    }

    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    const cartItem = await CartItem.findOne({
      where: {
        cartId: userCart.id,
        productId: product.id,
      },
    });

    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart." });
    }

    if (cartItem.quantity > 1) {
      cartItem.quantity -= 1;
      await cartItem.save();
    } else {
      await cartItem.destroy();
    }

    res.status(201).json({
      message: "Product removed from cart successfully",
      product: product,
    });
  }
}

module.exports = new shopController();