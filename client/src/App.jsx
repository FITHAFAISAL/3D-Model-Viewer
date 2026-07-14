import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Viewer from "./pages/Viewer";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/viewer/:id" element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;