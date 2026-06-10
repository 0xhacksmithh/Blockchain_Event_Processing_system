CREATE TABLE outbox(

    id UUID PRIMARY KEY,

    event_type TEXT,

    payload JSONB,

    status TEXT DEFAULT 'PENDING',

    retry_count INT DEFAULT 0,

    error_message TEXT,

    created_at TIMESTAMP DEFAULT NOW(),

    published_at TIMESTAMP
);