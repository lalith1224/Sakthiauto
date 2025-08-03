const express = require('express');
const router = express.Router();
const pool = require('./database');

// POST endpoint to submit QC register data
router.post('/api/qc-register', async (req, res) => {
    const {
        record_date, disa_line, part_name, heat_code, qty_moulds, remarks,
        c1, si1, mn1, p1, s1, mg1, f_l1, cu1, cr1,
        c2, si2, mn2, s2, cr2, cu2, sn2,
        pouring_time, pouring_temp, pp_code, fc_no_heat_no,
        mg_kgs, res_mg, converter_percent, rec_mg_percent, stream_innoculat, p_time_sec,
        treatment_no, con_no, tapping_time, corrective_addition_kgs, tapping_wt_kgs
    } = req.body;

    try {
        // Insert new record
        const result = await pool.query(
            `INSERT INTO qc_register (
                record_date, disa_line, part_name, heat_code, qty_moulds, remarks,
                c1, si1, mn1, p1, s1, mg1, f_l1, cu1, cr1,
                c2, si2, mn2, s2, cr2, cu2, sn2,
                pouring_time, pouring_temp, pp_code, fc_no_heat_no,
                mg_kgs, res_mg, converter_percent, rec_mg_percent, stream_innoculat, p_time_sec,
                treatment_no, con_no, tapping_time, corrective_addition_kgs, tapping_wt_kgs
            ) VALUES (
                $1, $2, $3, $4, $5, $6, 
                $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22,
                $23, $24, $25, $26,
                $27, $28, $29, $30, $31, $32,
                $33, $34, $35, $36, $37
            ) RETURNING *`,
            [
                record_date, disa_line, part_name, heat_code, qty_moulds, remarks,
                c1, si1, mn1, p1, s1, mg1, f_l1, cu1, cr1,
                c2, si2, mn2, s2, cr2, cu2, sn2,
                pouring_time, pouring_temp, pp_code, fc_no_heat_no,
                mg_kgs, res_mg, converter_percent, rec_mg_percent, stream_innoculat, p_time_sec,
                treatment_no, con_no, tapping_time, corrective_addition_kgs, tapping_wt_kgs
            ]
        );

        if (result.rowCount === 1) {
            res.status(201).json({
                message: 'QC Register data submitted successfully',
                record: result.rows[0]
            });
        } else {
            res.status(500).json({ error: 'Failed to insert QC Register data' });
        }
    } catch (error) {
        console.error('Error submitting QC Register data:', error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
