
import Home from "./pages/Home";
import Map from "./pages/Map";


import { Routes, Route } from "react-router-dom";
import './css/App.css';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Map/>} />
      </Routes>
    </>


  )
}

export default App
