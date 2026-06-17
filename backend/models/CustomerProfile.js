const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const User = require("./User");

const CustomerProfile = sequelize.define("CustomerProfile", {
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
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  favoriteColors: {
    type: DataTypes.TEXT, // JSON string array of favorite colors
    allowNull: true
  },
  favoriteCategories: {
    type: DataTypes.TEXT, // JSON string array of favorite categories
    allowNull: true
  },
  preferredPackagingStyle: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "Luxury" // 'Luxury', 'Romantic', 'Corporate', 'Festive'
  }
}, {
  tableName: "customer_profiles",
  timestamps: false
});

module.exports = CustomerProfile;
