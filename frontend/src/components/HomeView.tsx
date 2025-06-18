import { Box, Button } from "@mui/material";
import { useState } from "react";
import AddBoxIcon from "@mui/icons-material/AddBox";
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
      <Box sx={{ padding: 4 }}>
        <h1>FOODIE</h1>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          endIcon={<AddBoxIcon />}
          onClick={() => onCreate(username)}
          disabled={!username.trim()}
        >
          Create a new room
        </Button>
        <Button
          size="large"
          variant="outlined"
          endIcon={<AddBoxIcon />}
          onClick={onJoin}
        >
          Join a room
        </Button>
      </Box>
    </>
  );
};

export default HomeView;
