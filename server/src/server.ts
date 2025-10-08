import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import boardRoutes from './routes/boardRoutes';
import cardRoutes from './routes/cardRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔑 Environment loaded:', {
    hasMongoUri: !!process.env.MONGODB_URI,
    hasGroqKey: !!process.env.GROQ_API_KEY,
    hasJwtSecret: !!process.env.JWT_SECRET,
    port: process.env.PORT
});

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/ai', aiRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        groqApiKey: process.env.GROQ_API_KEY ? 'Configured ✓' : 'Missing ✗',
        mongodb: 'Connected ✓'
    });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

export default app;
