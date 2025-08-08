import mongoose from 'mongoose';

/**
 * Connects to MongoDB using mongoose
 * @returns Promise that resolves when connected
 */
export async function connectToDatabase(): Promise<void> {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Please configure it in your environment.');
  }

  try {
    // Parse the URI to extract database name
    let dbName = 'bridgemind';
    try {
      const parsed = new URL(MONGODB_URI);
      const dbNameFromUri = decodeURIComponent(parsed.pathname.replace(/^\//, ''));
      if (dbNameFromUri && dbNameFromUri !== 'test') {
        dbName = dbNameFromUri;
      }
    } catch {
      // If URL parsing fails, use default dbName
    }

    const options: mongoose.ConnectOptions = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      dbName: dbName,
    };

    await mongoose.connect(MONGODB_URI, options);
    
    console.log(`✅ Connected to MongoDB (database: ${dbName})`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export default connectToDatabase;
