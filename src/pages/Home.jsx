import ComplaintForm from '../components/ComplaintForm';
import Earth from '../components/Earth';
import '../css/Home.css'

function Home(){
    return <div className = "home-container">
        <ComplaintForm />
        <Earth />
    </div>
    
}

export default Home