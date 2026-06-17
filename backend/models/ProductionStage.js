const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const Order = require("./Order");

const ProductionStage = sequelize.define("ProductionStage", {
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
  stage: {
    type: DataTypes.STRING,
    allowNull: false // 'Design', 'Production', 'Packaging', 'Quality Check', 'Dispatch', 'Delivered'
  },
  assignedEmployee: {
    type: DataTypes.STRING,
    allowNull: true
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  statusNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Pending" // 'Pending', 'In Progress', 'Completed'
  }
}, {
  tableName: "production_stages",
  timestamps: false
});

module.exports = ProductionStage;
