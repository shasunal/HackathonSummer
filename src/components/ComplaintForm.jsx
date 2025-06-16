import '../css/ComplaintForm.css'
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Earth from './Earth';

function ComplaintForm({ missingInfo, onResult }) {
    const [complaintInput, setComplaintInput] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/complaintSubmit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ complaint: complaintInput }),
            });

            const data = await response.json();
            console.log("GPT Response:", data);

            if (data.status === "missing") {
                // Show the missing fields
                const message = `Missing: ${data.missing.join(", ")}`;
                onResult(null, message);
                return;
            }

            if (data.status === "complete") {
                setSubmitted(true);
                onResult(data.summary, null, data.zipcode);
                return;
            }

            alert("Unexpected response format.");

        } catch (err) {
            console.error('❌ Fetch failed:', err);
            alert('Could not reach server');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Earth zoom={submitted} />

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
        </>
    );
}

export default ComplaintForm;
