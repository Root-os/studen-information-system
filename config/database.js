const { Sequelize } = require('sequelize');
require('dotenv').config();

const {
  DB_USER = 'root',
  DB_PASSWORD = '',
  DB_NAME = 'school_db',
  DB_HOST = 'localhost',
  DB_PORT = '3306',
  DB_SOCKET,
  NODE_ENV = 'development',
} = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: Number(DB_PORT),
  dialect: 'mysql',
  logging: false,
  define: {
    underscored: false,
    timestamps: true,
  },
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
  },
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
    ...(DB_SOCKET ? { socketPath: DB_SOCKET } : {}),
  },
  timezone: '+03:00',
});

module.exports = sequelize;
