import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { Button, FormControl, FormLabel } from "@mui/material";
import Box from "@mui/material/Box";
import { wsClient } from "../manager/websocket";

const PreferencesRoomView = () => {
  return (
    <Box>
      <Box sx={{ display: "flex", flexDirection: "row" }}>
        <FormControl sx={{ marginRight: 10 }}>
          <FormLabel component="legend">Location Rating</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="1 star"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="2 star"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="3 star"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="4 star"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="5 star"
            ></FormControlLabel>
          </FormGroup>
        </FormControl>
        <FormControl sx={{ marginLeft: 5 }}>
          <FormLabel component="legend">Ethnic Origin</FormLabel>
          <FormGroup>
            <FormControlLabel
              control={<Checkbox />}
              label="Asian"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="European"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="Middle Eastern & Mediterranean"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="South Asian"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="Latin American"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="Caribbean & Creole"
            ></FormControlLabel>
            <FormControlLabel
              control={<Checkbox />}
              label="North American"
            ></FormControlLabel>
          </FormGroup>
        </FormControl>
      </Box>
      <Button
        onClick={() =>
          wsClient.send({
            Message: "NEXT",
            User: localStorage.getItem("username"),
          })
        }
      >
        Next
      </Button>
    </Box>
  );
};

export default PreferencesRoomView;
