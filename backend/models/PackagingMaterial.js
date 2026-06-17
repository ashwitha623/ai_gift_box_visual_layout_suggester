const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const PackagingMaterial = sequelize.define("PackagingMaterial", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false // 'Box', 'Ribbon', 'Paper', 'Filler', 'Card'
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  availableQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  reservedQty: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 10
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "In Stock"
  }
}, {
  tableName: "packaging_materials",
  timestamps: false
});

module.exports = PackagingMaterial;
