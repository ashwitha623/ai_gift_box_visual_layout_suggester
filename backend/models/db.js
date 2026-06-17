const { Sequelize } = require("sequelize");
const path = require("path");

let sequelize;

const dbUrl = process.env.DATABASE_URL;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbPort = process.env.DB_PORT;

if (dbUrl) {
  console.log("Connecting to database using DATABASE_URL (PostgreSQL)...");
  sequelize = new Sequelize(dbUrl, {
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else if (dbHost && dbUser && dbPassword && dbName) {
  console.log("Connecting to PostgreSQL database using host configuration...");
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort || 5432,
    dialect: "postgres",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  console.log("No PostgreSQL config found. Falling back to local SQLite database...");
  const sqlitePath = path.join(__dirname, "..", "database.sqlite");
  sequelize = new Sequelize({
    dialect: "sqlite",
    storage: sqlitePath,
    logging: false
  });
}

module.exports = sequelize;
