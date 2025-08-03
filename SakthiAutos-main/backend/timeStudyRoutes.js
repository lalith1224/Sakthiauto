const express = require('express');
const router = express.Router();
const pool = require('./database');

// POST endpoint to submit time study data
router.post('/api/time-study', async (req, res) => {
    const {
        shift,
        c, si, mn, p, s, cr, ni, al, cu, sn, mo,
        cac2_s, fesi_sh, femn_sic, cu_fecr,
        carbon_steel,
        part_name, heat_code, grade
    } = req.body;

    try {
        // Insert new time study record
        const result = await pool.query(
            `INSERT INTO time_study_process (
                shift,
                c, si, mn, p, s, cr, ni, al, cu, sn, mo,
                cac2_s, fesi_sh, femn_sic, cu_fecr,
                carbon_steel,
                part_name, heat_code, grade
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
            RETURNING *`,
            [
                shift,
                c, si, mn, p, s, cr, ni, al, cu, sn, mo,
                cac2_s, fesi_sh, femn_sic, cu_fecr,
                carbon_steel,
                part_name, heat_code, grade
            ]
        );

        if (result.rowCount === 1) {
            res.status(201).json({
                message: 'Time study data successfully recorded',
                record: result.rows[0]
            });
        } else {
            res.status(500).json({ error: 'Failed to insert time study data' });
        }
    } catch (error) {
        console.error('Error inserting time study data:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
