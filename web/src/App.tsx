import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import PopupPage from "./pages/PopupPage";
import { RunProvider } from "./hooks/useRun";
import "./index.css";


function App() {
  return (
    <RunProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PopupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </RunProvider>
  );
}

export default App;
