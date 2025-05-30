import '../css/Form.css';

function Home(){
 return <div className = "home-container">
    <div className = "form-popup">
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
            <button>Submit</button>
            <a href="/map" className="continue-link">continue to site</a>
            
    </div>
 </div>
    
}

export default Home