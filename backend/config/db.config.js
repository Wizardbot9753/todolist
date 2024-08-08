const pg = require('pg')
const dotenv = require('dotenv');
dotenv.config();
const { Pool } = pg

const pool = new Pool({
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port: process.env.DB_PORT,
    database: process.env.DB,
  })

  module.exports = { pool }