// server/routes/zips.js
import express from 'express';
import ZipEntry from '../models/ZipEntry.js'; // adjust path as needed

const router = express.Router();

router.get('/zips', async (req, res) => {
  try {
    const zips = await ZipEntry.find({});
    res.json(zips);

  } catch (err) {
    console.error('Failed to fetch ZIP data', err);
    res.status(500).json({ error: 'Internal Server Error' });

  }
});

export default router;