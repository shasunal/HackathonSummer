import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import complaintRoutes from './routes/complaintSubmit.js';
import zips from './routes/zips.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.send('API is running. Use POST /complaintSubmit or other endpoints.');
});

app.use('/', zips);
app.use('/', complaintRoutes);

mongoose.connect(`${process.env.MONGO_URI}${process.env.DB_NAME}`)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

