
// src/lib/mongodb.ts
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("[MongoDB Lib] CRITICAL: MONGODB_URI is not defined in your environment variables (e.g., .env.local). Database operations WILL FAIL. Please set it.");
} else {
  let loggedUri = MONGODB_URI;
  if (MONGODB_URI.startsWith('mongodb+srv://')) {
    try {
      const url = new URL(MONGODB_URI);
      loggedUri = `${url.protocol}//<credentials_hidden>@${url.host}${url.pathname}`;
    } catch (e) {
      loggedUri = "mongodb+srv://<credentials_hidden>@<cluster_details_hidden>";
    }
  }
  console.log(`[MongoDB Lib] MONGODB_URI detected. Target URI (credentials/specifics masked for srv): ${loggedUri}`);
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

let cached = (global as any).mongoose as MongooseCache;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect(): Promise<typeof mongoose> {
  console.log('[MongoDB Lib] dbConnect function CALLED.');

  if (!MONGODB_URI) {
    console.error('[MongoDB Lib] FATAL: dbConnect called, but MONGODB_URI is not defined in environment. Cannot connect.');
    throw new Error('MongoDB connection URI is undefined. Please set MONGODB_URI in your .env.local file.');
  }

  if (cached.conn) {
    console.log(`[MongoDB Lib] Using cached database connection to DB: ${cached.conn.connection.name}`);
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, 
      serverSelectionTimeoutMS: 5000, 
      dbName: 'starRank', 
    };
    console.log('[MongoDB Lib] No cached promise. Attempting to establish new MongoDB connection...');
    console.log(`[MongoDB Lib] Connecting with options: ${JSON.stringify(opts)}`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      console.log(`[MongoDB Lib] MongoDB Connection SUCCESSFUL. Connected to DB: ${mongooseInstance.connection.name}`);
      return mongooseInstance;
    }).catch(err => {
      console.error('--------------------------------------------------------------------');
      console.error('[MongoDB Lib] ### MongoDB Connection FAILED ###');
      console.error(`[MongoDB Lib] Error Message: ${err.message}`);
      console.error(`[MongoDB Lib] Error Reason:`, err.reason || 'No specific reason provided by driver.');
      console.error(`[MongoDB Lib] Check your MONGODB_URI, network access, and MongoDB server status.`);
      console.error('--------------------------------------------------------------------');
      cached.promise = null; 
      throw err; 
    });
  } else {
    console.log('[MongoDB Lib] Reusing existing connection promise.');
  }

  try {
    console.log('[MongoDB Lib] Awaiting connection promise to resolve...');
    cached.conn = await cached.promise;
    if (cached.conn) {
       console.log(`[MongoDB Lib] Connection promise RESOLVED. Active connection is to DB: ${cached.conn.connection.name}`);
    } else {
       console.error('[MongoDB Lib] Connection promise resolved but cached.conn is null. This should not happen.');
       throw new Error('MongoDB connection promise resolved but connection object is null.');
    }
  } catch (e: any) {
    console.error('[MongoDB Lib] dbConnect CRITICAL: Failed to resolve MongoDB connection promise.');
    console.error(`[MongoDB Lib] Error during await: ${e.message}`, e.stack);
    // Important to nullify promise here so a new attempt can be made if dbConnect is called again
    cached.promise = null; 
    cached.conn = null;
    throw e; 
  }

  return cached.conn;
}

export default dbConnect;

    