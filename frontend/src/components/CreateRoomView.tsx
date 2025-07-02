import { Box, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { CircularProgress } from "@mui/material";
import { wsClient } from "../manager/websocket";

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
    return () => clearInterval(interval);
  }, [roomCode, username]);

  useEffect(() => {
    if (ready && roomCode && username) {
      localStorage.setItem("username", username);
      localStorage.setItem("roomCode", roomCode);
      wsClient.connect(roomCode, username);
      setCurrentView("preferences");
    }
  }, [ready, roomCode, setCurrentView, username]);

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
      <h1>Room Code: {roomCode}</h1>
      {ready ? <p></p> : <CircularProgress />}
      <Button onClick={onBack}>Close</Button>
    </Box>
  );
};

export default CreateRoomView;
