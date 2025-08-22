import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, Card, FormControl } from "@mui/material";
import Box from "@mui/material/Box";
import { wsClient } from "../manager/websocket";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Message = {
  type: string;
  username?: string;
  step?: number;
  message?: string;
};

const PreferencesRoomView = () => {
  const [cuisines, setCuisines] = useState<Record<string, string[]>>({});
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/api/cuisines")
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
};

export default PreferencesRoomView;
