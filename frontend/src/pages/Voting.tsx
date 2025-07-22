import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import { wsClient } from "../manager/websocket";
import { useNavigate } from "react-router-dom";

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
    fetch(
      `http://localhost:8080/api/restaurants?roomCode=${localStorage.getItem(
        "roomCode"
      )}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.restaurants);
      });
  }, []);

  const handleVote = () => {
    const currentRestaurant = restaurants[currentIndex];
    const nextVotes = {
      ...votes,
      [currentRestaurant.name]: true,
    };
    setVotes(nextVotes);

    //All restaurants have been voted on
    if (currentIndex + 1 >= restaurants.length) {
      fetch("http://localhost:8080/api/votes/send", {
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
      <Typography sx={{ textAlign: "center", mt: 4 }}>
        🎉 Thanks for voting! Waiting on others...
      </Typography>
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
            onClick={() => handleVote()}
          >
            No
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckIcon />}
            onClick={() => handleVote()}
          >
            Yes
          </Button>
        </CardActions>
      </Card>
    </Box>
  );
};

export default Voting;
