CREATE TABLE checkpoints(

    contract_address TEXT PRIMARY KEY,

    last_processed_block BIGINT
);