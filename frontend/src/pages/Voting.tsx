import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Divider,
  LinearProgress,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { wsClient } from "../manager/websocket";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

type Restaurant = {
  name: string;
  cuisine: string;
  lat: number;
  lng: number;
};

type Message = {
  type: string;
  username?: string;
  step?: number;
  message?: string;
};

const Voting = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const listener = (msg: Message) => {
      if (msg.type === "stepAdvanced" && msg.step === 4) {
        navigate("/results");
      }
    };

    wsClient.addMessageListener(listener);

    return () => {
      wsClient.removeMessageListener(listener);
    };
  }, [navigate]);

  useEffect(() => {
    fetch(`${API_URL}/api/restaurants/${localStorage.getItem("roomCode")}`, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants);
      });
  }, []);

  const handleVote = (vote: boolean) => {
    const currentRestaurant = restaurants[currentIndex];
    const nextVotes = {
      ...votes,
      [currentRestaurant.name]: vote,
    };
    setVotes(nextVotes);

    //All restaurants have been voted on
    if (currentIndex + 1 >= restaurants.length) {
      fetch(`${API_URL}/api/votes/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomCode: localStorage.getItem("roomCode"),
          username: localStorage.getItem("username"),
          nextVotes,
        }),
      }).then(() => {
        wsClient.send({
          type: "votes",
          username: localStorage.getItem("username"),
          roomCode: localStorage.getItem("roomCode"),
        });
        setCurrentIndex(restaurants.length);
      });
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  if (restaurants.length === 0) {
    return (
      <Typography sx={{ textAlign: "center", mt: 4 }}>
        Loading restaurants...
      </Typography>
    );
  }

  if (currentIndex >= restaurants.length) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          textAlign: "center",
          bgcolor: "background.default",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "50%",
            maxWidth: 400,
            boxShadow: 20,
            padding: 4,
            bgcolor: "card.main",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Votes submitted! Waiting for others...
          </Typography>
          <LinearProgress color="success" sx={{ width: "100%", mt: 2 }} />
        </Box>
      </Box>
    );
  }

  const currentRestaurant = restaurants[currentIndex];

  return (
    <Box sx={{ display: "flex", justifyContent: "center", marginTop: 4 }}>
      <Card sx={{ width: 400, padding: 2, borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold">
            {currentRestaurant.name}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <FastfoodIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body1">{currentRestaurant.cuisine}</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <RoomIcon fontSize="small" sx={{ mr: 1 }} />
            <Typography variant="body2">
              {currentRestaurant.lat.toFixed(3)},{" "}
              {currentRestaurant.lng.toFixed(3)}
            </Typography>
          </Box>

          <Box sx={{ marginTop: 2 }}>
            <Divider sx={{ my: 1 }} />
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ mb: 1 }}
            >
              Map Preview:
            </Typography>
            <Box
              component="iframe"
              width="100%"
              height="150"
              sx={{ borderRadius: 1 }}
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                currentRestaurant.name
              )}&z=9&output=embed`}
            />
          </Box>
        </CardContent>

        <CardActions sx={{ justifyContent: "space-around" }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<ClearIcon />}
            onClick={() => handleVote(false)}
          >
            No
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleVote(true)}
          >
            Yes
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Voting;
