import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import Voting from "./pages/Voting";
import Results from "./pages/Results";
import PreferencesRoomView from "./components/PreferencesRoomView";
import { CssBaseline, Switch, ThemeProvider } from "@mui/material";
import { getAppTheme } from "./themes/theme";
import type { Theme } from "@mui/material/styles";
import { wsClient } from "./manager/websocket";
import { useNavigate } from "react-router-dom";

type Message = {
  type: string;
  username?: string;
  step?: number;
  message?: string;
};

const App = () => {
  const [toggleDarkMode, setToggleDarkMode] = useState(true);
  const theme: Theme = getAppTheme(toggleDarkMode ? "dark" : "light");
  const navigate = useNavigate();

  useEffect(() => {
    const roomCode = localStorage.getItem("roomCode");
    const currentPath = window.location.pathname;
    if (!roomCode && currentPath !== "/") {
      navigate("/");
    }
    const handleRoomDeleted = (msg: Message) => {
      if (msg.type === "roomDeleted") {
        alert("Room has been deleted by the host. Returning to home page.");
        navigate("/");
      }
    };
    wsClient.addMessageListener(handleRoomDeleted);

    return () => {
      wsClient.removeMessageListener(handleRoomDeleted);
    };
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Switch
          checked={toggleDarkMode}
          onChange={() => setToggleDarkMode(!toggleDarkMode)}
        />
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/voting" element={<Voting />} />
        <Route path="/results" element={<Results />} />
        <Route path="/preferences" element={<PreferencesRoomView />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
