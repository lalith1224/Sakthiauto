const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '../.env' });

// Create the database pool
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

// Test database connection
pool.connect((err, client, done) => {
  if (err) {
    console.error('QF07_FBQ - Database connection test failed:', err.stack);
  } else {
    console.log('QF07_FBQ - Database connected successfully');
    done();
  }
});

// Endpoint: Submit QC data
router.post('/api/qc', async (req, res) => {
  try {
    const {
      component_in_production,
      flow_rate_setting_a,
      flow_rate_display_b,
      hot_box_temp,
      air_pressure,
      inject_pressure,
      feed_pipe_condition,
      powder_size,
      moisture,
      is_new_bag,
      air_drier_function,
      filter_cleaning,
      gauge_test,
      hourly_time
    } = req.body;

    const query = `
      INSERT INTO "QF 07 FBQ - 02" (
        component_in_production,
        flow_rate_setting_a,
        flow_rate_display_b,
        hot_box_temp,
        air_pressure,
        inject_pressure,
        feed_pipe_condition,
        powder_size,
        moisture,
        is_new_bag,
        air_drier_function,
        filter_cleaning,
        gauge_test,
        hourly_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *;
    `;

    const values = [
      component_in_production,
      flow_rate_setting_a,
      flow_rate_display_b,
      hot_box_temp,
      air_pressure,
      inject_pressure,
      feed_pipe_condition,
      powder_size,
      moisture,
      is_new_bag,
      air_drier_function,
      filter_cleaning,
      gauge_test,
      hourly_time || new Date()
    ];

    const newRecord = await pool.query(query, values);
    res.json(newRecord.rows[0]);

    await pool.query(
      `UPDATE master_data 
       SET last_used = NOW() 
       WHERE product_code = $1`,
      [component_in_production]
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
router.get('/qc', async (req, res) => {
  try {
    const allRecords = await pool.query('SELECT * FROM "QF 07 FBQ - 02"');
    res.json(allRecords.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
router.get('/products/search', async (req, res) => {
  try {
    const { query } = req.query;
    const result = await pool.query(
      `SELECT product_code, product_description 
       FROM master_data 
       WHERE product_code ILIKE $1 
       LIMIT 10`,
      [`%${query}%`]
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Product search error:", error);
    res.status(500).json({ error: error.message });
  }
});
router.get('/master-data', async (req, res) => {
  try {
    const data = await pool.query(
      'SELECT product_code, product_description FROM master_data'
    );
    res.json(data.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get('/qc/last', async (req, res) => {
  try {
    const { product } = req.query;
    const result = await pool.query(
      `SELECT * FROM "QF 07 FBQ - 02" 
       WHERE component_in_production = $1 
       ORDER BY record_time DESC 
       LIMIT 1`,
      [product]
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});
router.post('/update-last-used', async (req, res) => {
  try {
    const { product_code } = req.body;
    await pool.query(
      `UPDATE master_data 
       SET last_used = NOW() 
       WHERE product_code = $1`,
      [product_code]
    );
    res.status(200).send("Last used timestamp updated");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});



module.exports = router;
