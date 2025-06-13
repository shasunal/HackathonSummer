import ComplaintForm from '../components/ComplaintForm';
import Earth from '../components/Earth';
import { useLocation } from 'react-router-dom';
import '../css/Home.css'

function Home(){
    const location = useLocation();
    const missingInfo = location.state?.missingInfo;

    return <div className = "home-container">
        {!missingInfo ? (  //HTML for if first time loading page
            <>
                <ComplaintForm missingInfo = {missingInfo}/>
                <Earth />
            </>
        ) : (  //HTML for if missing info is required
            <>
               <ComplaintForm missingInfo = {missingInfo}/>
            </>
        )}

        {!missingInfo ? (<></>) : (<></>)
        }

    </div>
}

export default Home