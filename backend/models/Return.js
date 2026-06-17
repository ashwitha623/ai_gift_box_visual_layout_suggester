const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Order = require("./Order");

const Return = sequelize.define("Return", {
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
  type: {
    type: DataTypes.STRING,
    allowNull: false // 'Return', 'Replacement', 'Refund'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending" // 'Pending', 'Approved', 'Rejected'
  },
  adminNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "returns",
  timestamps: false
});

Return.belongsTo(Order, { foreignKey: "orderId", as: "order" });
Order.hasMany(Return, { foreignKey: "orderId", as: "returns" });

module.exports = Return;
