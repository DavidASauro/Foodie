import { Box, Button } from "@mui/material";
import { useState } from "react";
import TextField from "@mui/material/TextField";
import AccountCircle from "@mui/icons-material/AccountCircle";
import InputAdornment from "@mui/material/InputAdornment";

type Props = {
  onCreate: (username: string) => void;
  onJoin: () => void;
};

const HomeView = ({ onCreate, onJoin }: Props) => {
  const [username, setUsername] = useState("");
  return (
    <>
      <Box sx={{ padding: 3, textAlign: "center" }}>
        <h1>FOODIE</h1>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          id="input-with-icon-textfield"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccountCircle />
              </InputAdornment>
            ),
          }}
          variant="standard"
        />
        <Button
          size="large"
          variant="outlined"
          onClick={() => onCreate(username)}
          disabled={!username.trim()}
        >
          Create a new room
        </Button>
        <Button size="large" variant="outlined" onClick={onJoin}>
          Join a room
        </Button>
      </Box>
    </>
  );
};

export default HomeView;
