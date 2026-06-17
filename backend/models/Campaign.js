const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const User = require("./User");

const Campaign = sequelize.define("Campaign", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  corporateId: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id"
    },
    allowNull: false
  },
  budget: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  deliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Scheduled" // 'Scheduled', 'In Progress', 'Completed', 'Cancelled'
  },
  employeeListUrl: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "campaigns",
  timestamps: false
});

Campaign.belongsTo(User, { foreignKey: "corporateId", as: "corporate" });
User.hasMany(Campaign, { foreignKey: "corporateId", as: "campaigns" });

module.exports = Campaign;
