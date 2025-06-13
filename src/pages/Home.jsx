import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import ComplaintForm from '../components/ComplaintForm';
import Earth from '../components/Earth';
import '../css/Home.css'

function Home(){
    const location = useLocation();
    const initialMissingInfo = location.state?.missingInfo;

    const [missingInfo, setMissingInfo] = useState(initialMissingInfo || null);
    const [gptResult, setGptResult] = useState(null);
    const [showResult, setShowResult] = useState(false);  //Delay for waiting to show GPT response until zoom is finished

     // Called by ComplaintForm when GPT returns something
    const handleResult = (result, missing) => {
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
        setShowResult(true); // ✅ trigger fade-in display
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