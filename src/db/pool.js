const { Pool } = require('pg');
const dbInfo = require('../config/db');

const pool = new Pool(dbInfo);

module.exports = pool;
