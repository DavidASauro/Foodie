import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import {
  Button,
  Card,
  FormControl,
  LinearProgress,
  Typography,
} from "@mui/material";
import Box from "@mui/material/Box";
import { wsClient } from "../manager/websocket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

type Message = {
  type: string;
  username?: string;
  step?: number;
  message?: string;
};

const PreferencesRoomView = () => {
  const [cuisines, setCuisines] = useState<Record<string, string[]>>({});
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/cuisines`, {
      headers: { "Content-Type": "application/json" },
      method: "GET",
    })
      .then((res) => res.json())
      .then((data: { cuisineTypes: Record<string, string[]> }) => {
        setCuisines(data.cuisineTypes);
        const initialPrefs: Record<string, boolean> = {};
        Object.values(data.cuisineTypes)
          .flat()
          .forEach((cuisine: string) => {
            initialPrefs[cuisine] = false;
          });
        setPreferences(initialPrefs);
      });
  }, []);

  const handleCheckboxChange =
    (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: event.target.checked,
      }));
    };

  const handleSubmit = () => {
    wsClient.send({
      type: "preferences",
      username: localStorage.getItem("username"),
      roomCode: localStorage.getItem("roomCode"),
      preferences: preferences,
    });
    setSubmitted(true);
  };

  useEffect(() => {
    const listener = (msg: Message) => {
      if (msg.type === "stepAdvanced" && msg.step === 3) {
        navigate("/voting");
      }
    };

    wsClient.addMessageListener(listener);

    return () => {
      wsClient.removeMessageListener(listener);
    };
  }, [navigate]);

  if (submitted) {
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
            Preferences submitted! Waiting for others...
          </Typography>
          <LinearProgress color="success" sx={{ width: "100%", mt: 2 }} />
        </Box>
      </Box>
    );
  } else {
    return (
      <Box sx={{ padding: 2 }}>
        <FormControl sx={{ marginLeft: 2 }}>
          <Box sx={{ padding: 3, textAlign: "center" }}>
            <h1>Cuisine Preferences</h1>
          </Box>
          <FormGroup>
            {Object.entries(cuisines).map(([category, cuisinesInCategory]) => (
              <Card sx={{ padding: 2, marginBottom: 2 }} key={category}>
                <Box key={category} sx={{ marginBottom: 2 }}>
                  <Box sx={{ textAlign: "center" }}>
                    <h2>{category}</h2>
                  </Box>
                  {cuisinesInCategory.map((cuisine) => (
                    <FormControlLabel
                      key={cuisine}
                      control={
                        <Checkbox
                          checked={preferences[cuisine] || false}
                          onChange={handleCheckboxChange(cuisine)}
                        />
                      }
                      label={cuisine}
                    />
                  ))}
                </Box>
              </Card>
            ))}
          </FormGroup>
        </FormControl>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{ marginTop: 2 }}
          >
            Submit Preferences
          </Button>
        </Box>
      </Box>
    );
  }
};

export default PreferencesRoomView;
