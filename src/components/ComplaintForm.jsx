import '../css/ComplaintForm.css'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom'

function ComplaintForm({missingInfo}) {
    const [complaintInput, setComplaintInput] = useState('');
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5001/complaintSubmit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // email: emailInput,
                    // zipcode: zipInput,
                    complaint: complaintInput
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check if GPT flagged it as missing info
                if (response.status === 400 && data.message?.startsWith("Missing")) {
                    alert("GPT says: " + data.message);

                    // 🟢 Send GPT message to /followup page using state
                    navigate('/', {
                    state: {
                        missingInfo: data.message
                    }
                    });
                } else {
                    alert(data.message || 'Submission failed');
                }
                return;
            }

            // If submission and GPT passed
            navigate('/'); // or wherever you go on success
        } catch (err) {
            console.error('❌ Fetch failed:', err);
            alert('Could not reach server');
        }
    };


    return <div className = "form-popup">
            <form onSubmit={handleSubmit}>
    
                <div className = "form-group">
                    <label htmlFor="complaint"> 
                        <span>
                            {!missingInfo ?
                            ("Tell us about your trip in NYC. We'll make it safe.")
                            :(missingInfo) }

                        </span>
                    </label>
                    <textarea id="complaint" rows="4" value={complaintInput} onChange={(e) => setComplaintInput(e.target.value)} required></textarea>
                </div>
                <button type="submit">Submit</button>
                <Link to="/map" className="continue-link">continue to site</Link>
            </form>
        </div>
}

export default ComplaintForm