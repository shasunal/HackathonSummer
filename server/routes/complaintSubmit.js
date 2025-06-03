import express from 'express';
import Complaint from '../models/Complaint.js';

const router = express.Router();
router.post('/complaintSubmit', async (req, res) => {
    console.log('Incoming request:', req.body);
    try {
        const { email, zipcode, complaint } = req.body;

        if (!email || !zipcode || !complaint) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newComplaint = new Complaint({
            email,
            zipcode,
            complaint,
        });

        await newComplaint.save();

        res.status(201).json({ message: 'Complaint uploaded successfully!', complaint: newComplaint });
    } catch (err) {
        console.error('Error saving Complaint:', err);
        res.status(500).json({ message: 'Server error during Complaint upload' });
    }
});

export default router;
