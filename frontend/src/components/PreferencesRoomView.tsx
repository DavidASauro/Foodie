import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, FormControl, FormLabel } from "@mui/material";
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
      <FormControl sx={{ marginLeft: 5 }}>
        <FormLabel component="legend">Cuisine Preferences</FormLabel>
        <FormGroup>
          {Object.entries(cuisines).map(([category, cuisinesInCategory]) => (
            <Box key={category} sx={{ marginBottom: 2 }}>
              <FormLabel>{category}</FormLabel>
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
          ))}
        </FormGroup>
      </FormControl>
      <Button variant="contained" onClick={handleSubmit} sx={{ marginTop: 2 }}>
        Submit Preferences
      </Button>
    </Box>
  );
};

export default PreferencesRoomView;
