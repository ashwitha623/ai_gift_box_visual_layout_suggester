const { DataTypes } = require("sequelize");
const sequelize = require("./db");

const LayoutTemplate = sequelize.define("LayoutTemplate", {
  id: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  minSpacing: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0.6
  },
  fragileBuffer: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.5
  },
  allowRotation: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  alignmentPreference: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "center"
  },
  preferredPlacementZone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "radial"
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: "layout_templates",
  timestamps: false
});

module.exports = LayoutTemplate;
