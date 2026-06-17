const { DataTypes } = require("sequelize");
const sequelize = require("./db");
const User = require("./User");

const CRMContact = sequelize.define("CRMContact", {
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
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  relationship: {
    type: DataTypes.STRING,
    allowNull: true
  },
  occasionType: {
    type: DataTypes.STRING,
    allowNull: false // 'birthday', 'anniversary', 'festival', etc.
  },
  occasionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  reminderSent: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Scheduled" // 'Scheduled', 'Sent', 'Pending'
  },
  autoSchedule: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "crm_contacts",
  timestamps: false
});

CRMContact.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(CRMContact, { foreignKey: "userId", as: "contacts" });

module.exports = CRMContact;
