import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import Voting from "./pages/Voting";
import Results from "./pages/Results";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/voting" element={<Voting />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
};

export default App;
