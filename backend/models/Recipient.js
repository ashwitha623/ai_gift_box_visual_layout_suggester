const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Order = require("./Order");

const Recipient = sequelize.define("Recipient", {
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
    allowNull: false,
    unique: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customText: {
    type: DataTypes.STRING,
    allowNull: true
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logoUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "recipients",
  timestamps: false
});

Recipient.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Order.hasOne(Recipient, { foreignKey: "orderId", as: "recipient" });

module.exports = Recipient;
