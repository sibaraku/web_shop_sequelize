const Sequelize = require("sequelize");
const sequelize = require("../util/db");

const Order = sequelize.define("order", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  totalPrice: {
    type: Sequelize.DOUBLE,
    allowNull: false,
    defaultValue: 0,
  },
});

module.exports = Order;
