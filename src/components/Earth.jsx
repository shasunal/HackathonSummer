import '../css/Earth.css'

function Earth(){
    return <video width="640" height="360" controls="autoPlay">
      <source src="/videos/SpinningEarth.mp4" type="video/mp4" />
    </video>
}

export default Earth