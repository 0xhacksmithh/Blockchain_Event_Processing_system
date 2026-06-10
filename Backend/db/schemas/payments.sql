CREATE TABLE payments(

    payment_id BIGINT PRIMARY KEY,

    payer TEXT,

    amount NUMERIC,

    tx_hash TEXT,

    block_number BIGINT,

    created_at TIMESTAMP DEFAULT NOW()
);