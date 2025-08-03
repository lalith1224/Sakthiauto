-- Master data table
CREATE TABLE master_data (
    product_code VARCHAR(20) PRIMARY KEY,
    s_no SERIAL,
    product_description VARCHAR(255) NOT NULL,
    grade VARCHAR(10),
    prod_group VARCHAR(255),
    last_used TIMESTAMPTZ
);

-- First QC table (QF 07 FBQ - 02) with micro/macro structure
CREATE TABLE "QF 07 FBQ - 02" (
    id SERIAL PRIMARY KEY,
    record_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    component_in_production VARCHAR(20) REFERENCES master_data(product_code) NOT NULL,
    flow_rate_setting_a DECIMAL,
    flow_rate_display_b DECIMAL,
    hot_box_temp DECIMAL,
    air_pressure DECIMAL,
    inject_pressure DECIMAL,
    feed_pipe_condition TEXT,
    powder_size DECIMAL,
    moisture DECIMAL,
    is_new_bag BOOLEAN DEFAULT FALSE,
    air_drier_function BOOLEAN,
    filter_cleaning BOOLEAN,
    gauge_test DECIMAL,
    signature TEXT,
    hourly_time TIMESTAMPTZ,
    micro_structure VARCHAR(100) DEFAULT 'Inoculation System Checks',
    macro_structure VARCHAR(100) DEFAULT 'Pre-Process'
);

-- Second QC table with combined design and event-based logging
CREATE TABLE "QF 07 FBQ - 03" (
    id SERIAL PRIMARY KEY,
    component_in_production VARCHAR(20) REFERENCES master_data(product_code) NOT NULL,
    -- Hourly parameters (collected every hour)
    inoculation_flow_rate_rpm DECIMAL,       -- RPM setting
    inoculation_flow_rate_gms DECIMAL,       -- GMS/sec setting
    air_pressure DECIMAL CHECK (air_pressure >= 4.0),  -- Min 4.0 bar
    inject_pressure DECIMAL CHECK (inject_pressure <= 2.0),  -- Max 2.0 bar
    feed_pipe_condition TEXT,                -- Including clamping
    -- 4-hourly parameters
    air_line_water_drainage BOOLEAN,         -- Every 4 hours
    hopper_cleaning BOOLEAN,                 -- Every 4 hours
    -- Bag change parameters
    inoculant_powder_size DECIMAL,           -- Only when new bag is used
    inoculant_powder_moisture DECIMAL,       -- Only when new bag is used
    is_new_bag BOOLEAN DEFAULT FALSE,        -- Flag for bag change events
    -- Daily parameters
    gauge_test DECIMAL,                      -- ±10% (recorded once per day)
    -- Metadata
    micro_structure VARCHAR(100) DEFAULT 'Inoculation System Checks',
    macro_structure VARCHAR(100) DEFAULT 'Pre-Process',
    signature TEXT,                          -- For future use
    -- Event type and timestamp
    event_type VARCHAR(20) NOT NULL CHECK (
        event_type IN ('hourly', '4-hourly', 'bag_change', 'gauge_test')
    ),
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recently used products
CREATE TABLE recently_used_products (
    user_id VARCHAR(50),
    product_code VARCHAR(20) REFERENCES master_data(product_code),
    last_used TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, product_code)
);

-- Time study process table
CREATE TABLE time_study_process (
    id SERIAL PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    shift VARCHAR(10),
    part_name VARCHAR(100) NOT NULL,
    heat_code VARCHAR(50) NOT NULL,
    grade VARCHAR(50) NOT NULL,
    c FLOAT,
    si FLOAT,
    mn FLOAT,
    p FLOAT,
    s FLOAT,
    cr FLOAT,
    ni FLOAT,
    al FLOAT,
    cu FLOAT,
    sn FLOAT,
    mo FLOAT,
    cac2_s FLOAT,
    fesi_sh FLOAT,
    femn_sic FLOAT,
    cu_fecr FLOAT,
    carbon_steel VARCHAR(50),
    micro_structure VARCHAR(100) DEFAULT 'Melting/Pouring Control',
    macro_structure VARCHAR(100) DEFAULT 'In-Process Documents'
);

-- QC Register table
CREATE TABLE qc_register (
    id SERIAL PRIMARY KEY,
    record_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    record_date DATE NOT NULL,
    disa_line VARCHAR(20),
    part_name VARCHAR(100) NOT NULL,
    heat_code VARCHAR(50) NOT NULL,
    qty_moulds INTEGER,
    remarks TEXT,
    
    -- Metal Composition 1 (%)
    c1 FLOAT,
    si1 FLOAT,
    mn1 FLOAT,
    p1 FLOAT,
    s1 FLOAT,
    mg1 FLOAT,
    f_l1 FLOAT,
    cu1 FLOAT,
    cr1 FLOAT,
    
    -- Metal Composition 2 (%)
    c2 FLOAT,
    si2 FLOAT,
    mn2 FLOAT,
    s2 FLOAT,
    cr2 FLOAT,
    cu2 FLOAT,
    sn2 FLOAT,
    
    -- Pouring Parameters
    pouring_time TIME,
    pouring_temp FLOAT,
    pp_code VARCHAR(20),
    fc_no_heat_no VARCHAR(50),
    
    -- Magnesium Treatment
    mg_kgs FLOAT,
    res_mg FLOAT,
    converter_percent FLOAT,
    rec_mg_percent FLOAT,
    stream_innoculat FLOAT,
    p_time_sec FLOAT,
    
    -- Tapping Information
    treatment_no VARCHAR(20),
    con_no VARCHAR(20),
    tapping_time TIME,
    corrective_addition_kgs FLOAT,
    tapping_wt_kgs FLOAT
);
