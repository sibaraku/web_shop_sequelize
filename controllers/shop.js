const Product = require("../models/product");
const CartItem = require("../models/cart-item");
const Cart = require("../models/cart");
const Order = require("../models/order");
const OrderItem = require("../models/order-item");

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

  async createOrder(req, res) {
    try {
      const userCart = await req.user.getCart();
      if (!userCart) {
        return res.status(404).json({ message: "Cart not found for user." });
      }

      const cartItems = await CartItem.findAll({
        where: { cartId: userCart.id },
      });

      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty." });
      }

      let totalPrice = 0;
      const order = await Order.create({ userId: req.user.id });

      for (const cartItem of cartItems) {
        const product = await Product.findByPk(cartItem.productId);
        if (product) {
          const itemTotal = product.price * cartItem.quantity;
          totalPrice += itemTotal;

          await OrderItem.create({
            orderId: order.id,
            productId: product.id,
            quantity: cartItem.quantity,
            price: product.price,
          });
        }
      }

      order.totalPrice = totalPrice;
      await order.save();

      await CartItem.destroy({
        where: { cartId: userCart.id },
      });

      res.status(201).json({
        message: "Order created successfully",
        order: order,
      });
    } catch (err) {
      console.error("Error in createOrder:", err);
      res.status(500).json({ message: "Server error" });
    }
  }

  async getOrders(req, res) {
    try {
      const orders = await Order.findAll({
        where: { userId: req.user.id },
      });

      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await order.getProducts({
            joinTableAttributes: ['quantity', 'price'],
          });
          return {
            ...order.dataValues,
            items: items,
          };
        })
      );

      res.status(200).json({
        orders: ordersWithItems,
      });
    } catch (err) {
      console.error("Error in getOrders:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
}

module.exports = new shopController();