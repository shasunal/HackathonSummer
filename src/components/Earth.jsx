import '../css/Earth.css';

function Earth({zoom}){
  return(
    <img src="/content/Earth.png" 
      alt="Earth" 
      className={`earth-img ${zoom ? 'zoom' : ''}`} 
    />
  );
}

export default Earth;
