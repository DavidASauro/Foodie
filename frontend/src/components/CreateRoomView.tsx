import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { wsClient } from "../manager/websocket";
import { useNavigate } from "react-router-dom";

type Props = {
  onBack: () => void;
  setCurrentView: (view: "home" | "create" | "join" | "preferences") => void;
  roomCode: string;
  username: string;
};

const CreateRoomView = ({
  onBack,
  roomCode,
  setCurrentView,
  username,
}: Props) => {
  const [ready, setReady] = useState<boolean>(false);
  const navigatingToPreferences = useRef<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Clear room info if this page is reloaded
    const handleBeforeUnload = () => {
      const roomCode = localStorage.getItem("roomCode");
      fetch(`http://localhost:8080/api/room/delete/${roomCode}`, {
        method: "DELETE",
        keepalive: true, // allows the request to finish even on unload
      }).catch((err) => console.error(err));

      localStorage.removeItem("username");
      localStorage.removeItem("roomCode");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`http://localhost:8080/api/room/status/${roomCode}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.ready && username) {
            setReady(true);
            clearInterval(interval);
          }
        })
        .catch((error) => console.error("Error fetching room status:", error));
    }, 2000);
    return () => {
      clearInterval(interval);
    };
  }, [roomCode, username]);

  useEffect(() => {
    if (ready && roomCode && username) {
      navigatingToPreferences.current = true;
      console.log("Connecting to WebSocket...");
      localStorage.setItem("username", username);
      localStorage.setItem("roomCode", roomCode);
      wsClient.connect(roomCode, username);
      //setCurrentView("preferences");

      navigate("/preferences");
    }
  }, [ready, roomCode, setCurrentView, username, navigate]);

  return (
    <Box
      sx={{
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
      }}
    >
      <Box
        sx={{
          textAlign: "center",
          gap: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h1>Room Code: {roomCode}</h1>
        {ready ? <p></p> : <CircularProgress color="success" />}
        <Typography variant="body2" color="textSecondary">
          Share this code with your friends to join the room.
        </Typography>
        <Button size="large" variant="outlined" onClick={onBack}>
          Close
        </Button>
      </Box>
    </Box>
  );
};

export default CreateRoomView;
