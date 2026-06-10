CREATE TABLE processed_events(

    event_id TEXT PRIMARY KEY,

    tx_hash TEXT,

    block_number BIGINT,

    created_at TIMESTAMP DEFAULT NOW()
);