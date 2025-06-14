import '../css/ComplaintForm.css'
import { useState } from 'react';
import { Link } from 'react-router-dom'
import Earth from './Earth';

function ComplaintForm({ missingInfo, onResult }) {
    const [complaintInput, setComplaintInput] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false); //New loading state for activating css when chatgpt is processing

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('http://localhost:5001/complaintSubmit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaint: complaintInput }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400 && data.message?.startsWith("Missing")) {
                    onResult(null, data.message);
                } else {
                    alert(data.message || 'Submission failed');
                }
                return;
            }

            setSubmitted(true);
            onResult(data.result, null);

        } catch (err) {
            console.error('❌ Fetch failed:', err);
            alert('Could not reach server');
        } finally {
            setLoading(false); // ✅ Stop loading
        }
    };


return(<>
    {/* Earth image with zoom */}
    <Earth zoom={submitted} />

    {/* Only show the form if not submitted */}
    {!submitted && (
        <div className="form-popup fade-in">
            {loading && <div className="loading-bar"></div>} 

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="complaint"> 
                        <span>
                            {!missingInfo ? "Tell us about your trip in NYC. We'll make it safe." : missingInfo}
                        </span>
                    </label>
                    <textarea
                        id="complaint"
                        rows="4"
                        value={complaintInput}
                        onChange={(e) => setComplaintInput(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div className="form-actions">
                    <button type="submit">Submit</button>
                    <Link to="/map" className="continue-link">continue to site</Link>
                </div>
            </form>
        </div>
    )}
</>)}

export default ComplaintForm