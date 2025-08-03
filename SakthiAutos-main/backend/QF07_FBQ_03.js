const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables from the project root
dotenv.config({ path: '../.env' });

// Create the database pool with environment variables
const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

// Test connection at startup
pool.connect((err, client, done) => {
  if (err) {
    console.error('QF07_FBQ_03 - Database connection test failed:', err.stack);
  } else {
    console.log('QF07_FBQ_03 - Database connected successfully');
    done();
  }
});

// Submit hourly QC data
router.post('/api/qc/fbq03/hourly', async (req, res) => {
  try {
    const {
      component_in_production,
      inoculation_flow_rate_rpm,
      inoculation_flow_rate_gms,
      air_pressure,
      inject_pressure,
      feed_pipe_condition
    } = req.body;

    const query = `
      INSERT INTO "QF 07 FBQ - 03" (
        component_in_production,
        inoculation_flow_rate_rpm,
        inoculation_flow_rate_gms,
        air_pressure,
        inject_pressure,
        feed_pipe_condition,
        event_type,
        micro_structure,
        macro_structure
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;

    const values = [
      component_in_production,
      inoculation_flow_rate_rpm,
      inoculation_flow_rate_gms,
      air_pressure,
      inject_pressure,
      feed_pipe_condition,
      'hourly',
      'Inoculation System Checks',
      'Pre-Process'
    ];

    const newRecord = await pool.query(query, values);
    
    // Update last used timestamp
    await pool.query(
      `UPDATE master_data 
       SET last_used = NOW() 
       WHERE product_code = $1`,
      [component_in_production]
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error('Error submitting hourly data:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Submit 4-hourly QC data
router.post('/api/qc/fbq03/4hourly', async (req, res) => {
  try {
    const {
      component_in_production,
      air_line_water_drainage,
      hopper_cleaning
    } = req.body;

    const query = `
      INSERT INTO "QF 07 FBQ - 03" (
        component_in_production,
        air_line_water_drainage,
        hopper_cleaning,
        event_type,
        micro_structure,
        macro_structure
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [
      component_in_production,
      air_line_water_drainage,
      hopper_cleaning,
      '4-hourly',
      'Inoculation System Checks',
      'Pre-Process'
    ];

    const newRecord = await pool.query(query, values);
    
    // Update last used timestamp
    await pool.query(
      `UPDATE master_data 
       SET last_used = NOW() 
       WHERE product_code = $1`,
      [component_in_production]
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error('Error submitting 4-hourly data:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Submit bag change QC data
router.post('/api/qc/fbq03/bag-change', async (req, res) => {
  try {
    const {
      component_in_production,
      inoculant_powder_size,
      inoculant_powder_moisture
    } = req.body;

    const query = `
      INSERT INTO "QF 07 FBQ - 03" (
        component_in_production,
        inoculant_powder_size,
        inoculant_powder_moisture,
        is_new_bag,
        event_type,
        micro_structure,
        macro_structure
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [
      component_in_production,
      inoculant_powder_size,
      inoculant_powder_moisture,
      true, // is_new_bag
      'bag_change',
      'Inoculation System Checks',
      'Pre-Process'
    ];

    const newRecord = await pool.query(query, values);
    
    // Update last used timestamp
    await pool.query(
      `UPDATE master_data 
       SET last_used = NOW() 
       WHERE product_code = $1`,
      [component_in_production]
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error('Error submitting bag change data:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Submit daily gauge test QC data
router.post('/api/qc/fbq03/gauge-test', async (req, res) => {
  try {
    const {
      component_in_production,
      gauge_test
    } = req.body;

    const query = `
      INSERT INTO "QF 07 FBQ - 03" (
        component_in_production,
        gauge_test,
        event_type,
        micro_structure,
        macro_structure
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const values = [
      component_in_production,
      gauge_test,
      'gauge_test',
      'Inoculation System Checks',
      'Pre-Process'
    ];

    const newRecord = await pool.query(query, values);
    
    // Update last used timestamp
    await pool.query(
      `UPDATE master_data 
       SET last_used = NOW() 
       WHERE product_code = $1`,
      [component_in_production]
    );

    res.json(newRecord.rows[0]);
  } catch (err) {
    console.error('Error submitting gauge test data:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get all QC records for a component
router.get('/api/qc/fbq03/:component', async (req, res) => {
  try {
    const { component } = req.params;
    
    const query = `
      SELECT * FROM "QF 07 FBQ - 03"
      WHERE component_in_production = $1
      ORDER BY event_time DESC
    `;
    
    const result = await pool.query(query, [component]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching QC records:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get specific event type records for a component
router.get('/api/qc/fbq03/:component/:eventType', async (req, res) => {
  try {
    const { component, eventType } = req.params;
    
    const query = `
      SELECT * FROM "QF 07 FBQ - 03"
      WHERE component_in_production = $1 AND event_type = $2
      ORDER BY event_time DESC
    `;
    
    const result = await pool.query(query, [component, eventType]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching QC records by event type:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// Get latest record for a component
router.get('/api/qc/fbq03/latest/:component', async (req, res) => {
  try {
    const { component } = req.params;
    
    const query = `
      SELECT * FROM "QF 07 FBQ - 03"
      WHERE component_in_production = $1
      ORDER BY event_time DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [component]);
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching latest QC record:', err.message);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;