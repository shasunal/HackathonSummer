
import Home from "./pages/Home";
import Map from "./pages/Map";


import { Routes, Route } from "react-router-dom";
import './css/App.css';

function App() {
  console.log('penis');

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map/>} />
        <Route path="/" element={<Map/>} />
      </Routes>
    </>


  )
}

export default App
