import '../css/ComplaintForm.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'

function ComplaintForm() {
    const navigate = useNavigate();
    const [emailInput, setEmailInput] = useState('');
    const [zipInput, setZipInput] = useState('');
    const [complaintInput, setComplaintInput] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // ✅ Use relative path — Vite proxy handles the backend redirect
            const response = await fetch('/complaintSubmit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: emailInput,
                    zipcode: zipInput,
                    complaint: complaintInput
                }),
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/map');
            } else {
                alert(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Server error');
        }
    };

    return <div className = "form-popup">
            <form onSubmit={handleSubmit}>
                <h1>Community Block</h1> 
                <p>See something? Say something.</p>
                <div className = "form-group">
                    <label htmlFor="email"> <span>Email*</span></label>
                    <input id = "email" type="email" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} required />
                </div>
                <div className = "form-group">
                    <label htmlFor="zip-code"> <span>Zip Code*</span></label>
                    <input id = "zip-code" type="text" value={zipInput} onChange={(e) => setZipInput(e.target.value)} required />
                </div>
                <div className = "form-group">
                    <label htmlFor="complaint"> <span>Complaint*</span></label>
                    <textarea id="complaint" rows="4" value={complaintInput} onChange={(e) => setComplaintInput(e.target.value)} required></textarea>
                </div>
                <button type="submit">Submit</button>
                <Link to="/map" className="continue-link">continue to site</Link>
            </form>
        </div>
}

export default ComplaintForm