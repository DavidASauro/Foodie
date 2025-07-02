import { Box, Button, TextField } from "@mui/material";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { wsClient } from "../manager/websocket";

type Props = {
  onBack: () => void;
  setCurrentView: (view: "home" | "create" | "join" | "preferences") => void;
};

const JoinRoomView = ({ onBack, setCurrentView }: Props) => {
  const [roomCode, setRoomCode] = useState("");
  const [username, setUsername] = useState("");

  const joinRoom = async ({
    roomCode,
    username,
  }: {
    roomCode: string;
    username: string;
  }): Promise<{ status: string }> => {
    const res = await fetch("http://localhost:8080/api/room/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomCode: roomCode, username: username }),
    });
    if (!res.ok) {
      throw new Error("Failed to join room");
    }
    return res.json();
  };

  const { mutate: joinRoomMutation } = useMutation({
    mutationFn: joinRoom,
    onSuccess: () => {
      localStorage.setItem("username", username);
      localStorage.setItem("roomCode", roomCode);
      wsClient.connect(roomCode, username);
      setCurrentView("preferences");
      console.log("Joined room with ID:", roomCode);
    },
  });

  return (
    <Box sx={{ textAlign: "center" }}>
      <h1>Join Room</h1>
      <TextField
        id="standard-basic"
        label="Username"
        variant="standard"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Box sx={{ display: "flex" }}>
        <TextField
          id="standard-basic"
          label="Room Code"
          variant="standard"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value)}
        />
      </Box>
      <Button onClick={onBack}>Back</Button>
      <Button
        onClick={() => joinRoomMutation({ roomCode, username })}
        disabled={!username || !roomCode}
      >
        Join
      </Button>
    </Box>
  );
};

export default JoinRoomView;
