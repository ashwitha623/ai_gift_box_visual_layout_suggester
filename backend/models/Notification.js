const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const User = require("./User");

const Notification = sequelize.define("Notification", {
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
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false // 'Design Approval Needed', 'Production Update', 'Order Dispatched', 'Delivery Completed', 'Occasion Reminder'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Unread" // 'Read', 'Unread'
  },
  channel: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "In-App" // 'Email', 'WhatsApp', 'SMS', 'In-App'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "notifications",
  timestamps: false
});

module.exports = Notification;
