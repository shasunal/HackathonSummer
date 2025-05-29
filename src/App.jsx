
import Home from "./pages/Home";

import { Routes, Route } from "react-router-dom";
import './css/App.css';

function App() {
  console.log('penis');

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
       
      </Routes>
    </>


  )
}

export default App
