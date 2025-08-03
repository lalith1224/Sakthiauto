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