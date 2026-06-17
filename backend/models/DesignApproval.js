const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Order = require("./Order");

const DesignApproval = sequelize.define("DesignApproval", {
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
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Draft Created" // 'Draft Created', 'Awaiting Customer Approval', 'Approved', 'Revision Requested', 'Final Approved'
  },
  revisionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  history: {
    type: DataTypes.TEXT, // Will store a JSON string of action logs
    allowNull: true
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "design_approvals",
  timestamps: false
});

module.exports = DesignApproval;
