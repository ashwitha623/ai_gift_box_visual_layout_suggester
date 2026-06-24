const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const PackagingBox = sequelize.define("PackagingBox", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  length: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  width: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  height: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  maxWeight: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  volume: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  cost: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 300
  },
  style: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Classic Luxury rigid"
  },
  ribbonStyle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Gold Satin Ribbon"
  },
  ribbonHex: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "#D4AF37"
  },
  packagingTheme: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Royal Luxury"
  },
  occasions: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "birthday,anniversary,wedding,corporate,graduation,festival,baby_shower,friendship,farewell,just_because"
  }
}, {
  tableName: "packaging_boxes",
  timestamps: false
});

module.exports = PackagingBox;
