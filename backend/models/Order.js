const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const User = require("./User");

const Order = sequelize.define("Order", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id"
    },
    allowNull: true
  },
  totalPrice: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Order Placed" // 'Order Placed', 'Customization', 'Packaging', 'Quality Check', 'Dispatch', 'Delivered'
  },
  ribbonColor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  boxSize: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Medium"
  },
  trackingId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending" // 'Pending', 'Paid', 'Failed'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true // 'UPI', 'Card', 'Net Banking'
  },
  invoiceUrl: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "orders",
  timestamps: false
});

Order.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Order, { foreignKey: "userId", as: "orders" });

module.exports = Order;
