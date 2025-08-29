import { Container, Box } from "@mui/material";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import HomeView from "../components/HomeView";
import CreateRoomView from "../components/CreateRoomView";
import JoinRoomView from "../components/JoinRoomView";
import PreferencesRoomView from "../components/PreferencesRoomView";
import Canvas from "../components/Canvas";
import { API_URL } from "../config";

const Home = () => {
  const [currentView, setCurrentView] = useState<
    "home" | "create" | "join" | "preferences"
  >("home");

  const createRoom = async (
    username: string
  ): Promise<{ roomCode: string }> => {
    const res = await fetch(`${API_URL}/api/room/createRoom`, {
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
    onSuccess: (data, variables) => {
      localStorage.setItem("roomCode", data.roomCode);
      localStorage.setItem("username", variables);
      setCurrentView("create");
      console.log("Room created with ID:", data.roomCode);
    },
  });

  const renderContent = () => {
    switch (currentView) {
      case "preferences":
        return <PreferencesRoomView />;
      case "create":
        return (
          <CreateRoomView
            onBack={() => {
              setCurrentView("home");
              fetch(
                `${API_URL}/api/room/delete/${localStorage.getItem(
                  "roomCode"
                )}`,
                {
                  method: "DELETE",
                }
              ).catch((error) => console.error("Error deleting room:", error));
              localStorage.removeItem("roomCode");
              localStorage.removeItem("username");
            }}
            roomCode={localStorage.getItem("roomCode") || ""}
            setCurrentView={setCurrentView}
            username={localStorage.getItem("username") || ""}
          />
        );
      case "join":
        return (
          <JoinRoomView
            onBack={() => setCurrentView("home")}
            //setCurrentView={setCurrentView}
          />
        );
      case "home":
      default:
        return (
          <div>
            <HomeView
              onCreate={(username) => createRoomMutation(username)}
              onJoin={() => setCurrentView("join")}
            />
          </div>
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
      <Canvas />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "50%",
          boxShadow: 20,
          padding: 4,
          bgcolor: "card.main",
          borderRadius: 2,
        }}
      >
        {renderContent()}
      </Box>
    </Container>
  );
};

export default Home;
