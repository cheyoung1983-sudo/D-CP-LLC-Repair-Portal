import { awsCredentialsProvider } from "@vercel/functions/oidc";
import { attachDatabasePool } from "@vercel/functions";
import { Signer } from "@aws-sdk/rds-signer";
import { ClientBase, Pool } from "pg";

let poolInstance: Pool | null = null;
let readOnlyPoolInstance: Pool | null = null;

export function getDatabasePool(): Pool {
  if (!poolInstance) {
    const host = process.env.PGHOST || "dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com";
    const port = Number(process.env.PGPORT || 5432);
    const user = process.env.PGUSER || "postgres";
    const region = process.env.AWS_REGION || "us-east-1";
    const database = process.env.PGDATABASE || "postgres";
    const roleArn = process.env.AWS_ROLE_ARN || "arn:aws:iam::595710543826:role/Vercel/access-dcp-production-db";

    let signer: Signer | null = null;
    try {
      signer = new Signer({
        hostname: host,
        port,
        username: user,
        region,
        credentials: awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        }),
      });
    } catch (e) {
      console.warn("[Database] RDS Signer initialization warning:", e);
    }

    poolInstance = new Pool({
      host,
      user,
      database,
      password: () => (signer ? signer.getAuthToken() : Promise.resolve("")),
      port,
      ssl: { rejectUnauthorized: false },
      max: 20,
    });

    try {
      attachDatabasePool(poolInstance);
    } catch (e) {
      console.warn("[Database] attachDatabasePool notice:", e);
    }
  }

  return poolInstance;
}

export function getReadOnlyDatabasePool(): Pool {
  if (!readOnlyPoolInstance) {
    const host = process.env.PGHOST_READ_ONLY || "dcp-production-db.cluster-ro-cs7wcksg2js1.us-east-1.rds.amazonaws.com";
    const port = Number(process.env.PGPORT || 5432);
    const user = process.env.PGUSER || "postgres";
    const region = process.env.AWS_REGION || "us-east-1";
    const database = process.env.PGDATABASE || "postgres";
    const roleArn = process.env.AWS_ROLE_ARN || "arn:aws:iam::595710543826:role/Vercel/access-dcp-production-db";

    let signer: Signer | null = null;
    try {
      signer = new Signer({
        hostname: host,
        port,
        username: user,
        region,
        credentials: awsCredentialsProvider({
          roleArn,
          clientConfig: { region },
        }),
      });
    } catch (e) {
      console.warn("[Database-RO] RDS Signer initialization warning:", e);
    }

    readOnlyPoolInstance = new Pool({
      host,
      user,
      database,
      password: () => (signer ? signer.getAuthToken() : Promise.resolve("")),
      port,
      ssl: { rejectUnauthorized: false },
      max: 20,
    });

    try {
      attachDatabasePool(readOnlyPoolInstance);
    } catch (e) {
      console.warn("[Database-RO] attachDatabasePool notice:", e);
    }
  }

  return readOnlyPoolInstance;
}

// Single query execution on primary cluster
export async function query(sql: string, args: unknown[] = []) {
  const pool = getDatabasePool();
  return pool.query(sql, args);
}

// Single query execution on read-only cluster replica
export async function queryReadOnly(sql: string, args: unknown[] = []) {
  const pool = getReadOnlyDatabasePool();
  return pool.query(sql, args);
}

// Transaction execution handler
export async function withConnection<T>(
  fn: (client: ClientBase) => Promise<T>,
): Promise<T> {
  const pool = getDatabasePool();
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}
