// server/models/ZipEntry.js
import mongoose from 'mongoose';

const zipEntrySchema = new mongoose.Schema({
  zipCode: String,
  data: String, // or whatever type you're storing
}, { collection: process.env.MODEL_COLLECTION_NAME});

const ZipEntry = mongoose.model('ZipEntry', zipEntrySchema);
export default ZipEntry;