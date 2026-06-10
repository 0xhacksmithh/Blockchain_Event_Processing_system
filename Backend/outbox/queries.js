import { db } from "../db/index.js";

export async function fetchPendingEvents() {
  const result = await db.query(
    `
        SELECT *
        FROM outbox
        WHERE status='PENDING'
        ORDER BY created_at
        LIMIT 100
        `,
  );
  return result.rows;
}

export async function markPublished(id) {
  await db.query(
    `
        UPDATE outbox
        SET status='PUBLISHED',
            published_at=NOW()
        WHERE id=$1
        `,
    [id],
  );
}

export async function markFailed(id, error) {
  await db.query(
    `
        UPDATE outbox
        SET retry_count=
            retry_count + 1,
            error_message=$1
        WHERE id=$2
        `,
    [error.message, id],
  );
}
