import mongoose from 'mongoose';

// User Schema
const complaintSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: false,
    }, 
    zipcode: {
        type: Number,
        required: true,
        unique: false,
    },
    complaint: {
        type: String,
        required: false,
    },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;
