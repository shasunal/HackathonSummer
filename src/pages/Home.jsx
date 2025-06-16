import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm';
import Earth from '../components/Earth';
import '../css/Home.css'
import {useNavigate} from 'react-router-dom';

function Home(){
    const location = useLocation();
    const initialMissingInfo = location.state?.missingInfo;

    const [missingInfo, setMissingInfo] = useState(initialMissingInfo || null);
    const [gptResult, setGptResult] = useState(null);
    const [showResult, setShowResult] = useState(false);  //Delay for waiting to show GPT response until zoom is finished
    const navigate = useNavigate();

     // Called by ComplaintForm when GPT returns something
    const handleResult = (result, missing, zipcode) => {
    if (missing) {
        setMissingInfo(missing);
        setGptResult(null);
        setShowResult(false);
    } else {
        setMissingInfo(null);
        setGptResult(result);
        setShowResult(false); // hide for now


        // Wait 2 seconds (adjust to match Earth zoom duration)
        setTimeout(() => {
            navigate('/map', {state: { analysis: result, zipcode: zipcode}});
        }, 2000);
    }
    };

    return <div className = "home-container">
        <ComplaintForm missingInfo={missingInfo} onResult={handleResult} />

        {showResult && (
            <div className="analysis-result fade-in">
                <h2>Safety Analysis</h2>
                <pre>{gptResult}</pre>
            </div>
        )}
    </div>
}

export default Home