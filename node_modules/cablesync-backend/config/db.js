const mongoose = require('mongoose');

const isProduction = process.env.NODE_ENV === 'production';

function isPlaceholderUri(uri) {
  if (!uri) return true;
  // Match template placeholders such as <username>, <password>, <cluster-url>, or angle bracket placeholders
  return /<[^>]+>/.test(uri) || uri.includes('<cluster-url>') || uri.includes('<username>') || uri.includes('<password>');
}

async function connectDB() {
  const uri = process.env.MONGO_URI;

  mongoose.set('bufferCommands', false);

  if (!uri || isPlaceholderUri(uri)) {
    if (isProduction) {
      // Do NOT silently fall back to the in-memory mock store in production —
      // that means the app looks like it's working while every payment,
      // customer edit, and login is lost on the next restart/deploy. Fail
      // loudly instead so a misconfigured deploy is caught immediately.
      throw new Error(
        'MONGO_URI is missing or a placeholder. Refusing to start in production without a real database ' +
          '(set MONGO_URI to your Atlas connection string in Render env vars).',
      );
    }
    console.log('[CableSync] In-memory mock store active (provide a valid MONGO_URI in .env to connect to MongoDB).');
    return;
  }

  // mongoose's directConnection option is only valid for a single standalone
  // host (e.g. local mongodb://127.0.0.1:27017). Atlas connection strings are
  // mongodb+srv://... replica sets, and the driver rejects directConnection
  // on those outright ("directConnection not supported with SRV URI"). Only
  // apply it for plain, non-SRV, single-host URIs — i.e. local/dev.
  const isSrv = uri.startsWith('mongodb+srv://');
  const connectOptions = {
    serverSelectionTimeoutMS: isProduction ? 10000 : 5000,
    retryWrites: isSrv ? true : false,
    ...(isSrv ? {} : { directConnection: true }),
  };

  try {
    await mongoose.connect(uri, connectOptions);
    console.log('MongoDB connected:', mongoose.connection.host);
  } catch (err) {
    if (isProduction) {
      // Same reasoning as above: a production deploy that can't reach its
      // database should crash and get noticed (Render will show it as
      // failed/restarting), not quietly serve traffic against nothing.
      throw new Error(`MongoDB connection failed in production: ${err.message}`);
    }
    console.log('[CableSync] MongoDB connection unavailable (' + err.message + ') — operating with in-memory store.');
  }
}

module.exports = connectDB;
