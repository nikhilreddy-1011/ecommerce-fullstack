import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import connectDB from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
    // Connect to MongoDB first
    await connectDB();

    app.listen(PORT, () => {
        console.log(`\n🚀 ShopX Backend running on http://localhost:${PORT}`);
        console.log(`📡 Environment: ${process.env.NODE_ENV}`);
        console.log(`🏥 Health check: http://localhost:${PORT}/api/health\n`);
    });
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...', reason.message);
    process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error.message);
    process.exit(1);
});

startServer();
