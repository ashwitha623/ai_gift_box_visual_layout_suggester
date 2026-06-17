const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Order = require("./Order");
const Product = require("./Product");

const OrderItem = sequelize.define("OrderItem", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  orderId: {
    type: DataTypes.INTEGER,
    references: {
      model: Order,
      key: "id"
    },
    allowNull: false
  },
  productId: {
    type: DataTypes.INTEGER,
    references: {
      model: Product,
      key: "id"
    },
    allowNull: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: "order_items",
  timestamps: false
});

OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });

OrderItem.belongsTo(Product, { foreignKey: "productId", as: "product" });

module.exports = OrderItem;
