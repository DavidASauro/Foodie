import { Container, Box } from "@mui/material";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import HomeView from "../components/HomeView";
import CreateRoomView from "../components/CreateRoomView";
import JoinRoomView from "../components/JoinRoomView";
import PreferencesRoomView from "../components/PreferencesRoomView";

const Home = () => {
  const [currentView, setCurrentView] = useState<
    "home" | "create" | "join" | "preferences"
  >("home");
  const [roomCode, setRoomCode] = useState<string>("");
  const createRoom = async (
    username: string
  ): Promise<{ room_code: string }> => {
    const res = await fetch("http://localhost:8080/api/room/createRoom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username: username }),
    });
    if (!res.ok) {
      throw new Error("Failed to create room");
    }

    return res.json();
  };

  const { mutate: createRoomMutation } = useMutation({
    mutationFn: createRoom,
    onSuccess: (data) => {
      setRoomCode(data.room_code);
      setCurrentView("create");
      console.log("Room created with ID:", data.room_code);
    },
  });

  const renderContent = () => {
    switch (currentView) {
      case "preferences":
        return <PreferencesRoomView />;
      case "create":
        return (
          <CreateRoomView
            onBack={() => setCurrentView("home")}
            roomCode={roomCode}
            setCurrentView={setCurrentView}
          />
        );
      case "join":
        return (
          <JoinRoomView
            onBack={() => setCurrentView("home")}
            setCurrentView={setCurrentView}
          />
        );
      case "home":
      default:
        return (
          <HomeView
            onCreate={(username) => createRoomMutation(username)}
            onJoin={() => setCurrentView("join")}
          />
        );
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "50%",
          boxShadow: 20,
          padding: 4,
        }}
      >
        {renderContent()}
      </Box>
    </Container>
  );
};

export default Home;
