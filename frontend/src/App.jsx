import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Intro from "./pages/Intro";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/intro" element={<Intro />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;