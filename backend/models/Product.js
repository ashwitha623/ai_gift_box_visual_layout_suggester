const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const Product = sequelize.define("Product", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  size: {
    type: DataTypes.STRING,
    allowNull: false // 'Small', 'Medium', 'Large'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: true
  },
  reservedQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5
  }
}, {
  tableName: "products",
  timestamps: false
});

module.exports = Product;
