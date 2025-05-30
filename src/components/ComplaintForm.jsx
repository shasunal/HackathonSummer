import '../css/ComplaintForm.css'

import { Link } from 'react-router-dom'

function ComplaintForm() {
    // const [emailInput, setEmailInput] = useState('');
    // const [passwordInput, setPasswordInput] = useState('');
    // const navigate = useNavigate();
    // const { addUser } = useUserContext(); // get addUser from context

    const handleSubmit = async (e) => {
        // e.preventDefault();

        // try {
        // const response = await fetch('http://localhost:5000/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({
        //     email: emailInput,
        //     password: passwordInput,
        //     }),
        // });

        // const data = await response.json();

        // if (response.ok) {
        //     addUser(data.token, data.email); // ✅ Save both token and email in context
        //     navigate('/YourStore');
        // } else {
        //     alert(data.message || 'Login failed');
        // }
        // } catch (error) {
        // console.error('Login error:', error);
        // alert('Server error');
        // }
    };

    return <div className = "form-popup">
            <form onSubmit={handleSubmit}>
                <h1>Community Block</h1> 
                <p>See something? Say something.</p>
                <div className = "form-group">
                    <label htmlFor="name"> <span>Name*</span></label>
                    <input id = "name" type="text" required />
                </div>
                <div className = "form-group">
                    <label htmlFor="email"> <span>Email*</span></label>
                    <input id = "email" type="email" required />
                </div>
                <div className = "form-group">
                    <label htmlFor="zip-code"> <span>Zip Code*</span></label>
                    <input id = "zip-code" type="text" required />
                </div>
                <div className = "form-group">
                    <label htmlFor="complaint"> <span>Complaint*</span></label>
                    <textarea id="complaint" rows="4" required></textarea>
                </div>
                <button type="submit">Submit</button>
                <Link to="/map" className="continue-link">continue to site</Link>
            </form>
        </div>
}

export default ComplaintForm