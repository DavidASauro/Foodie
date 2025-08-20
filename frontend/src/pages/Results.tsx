import {
  Box,
  Card,
  CardContent,
  Typography,
  Divider,
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";

/*
type Restaurant = {
  name: string;
  cuisine: string;
  lat: number;
  lng: number;
};
*/
const Results = () => {
  const [restaurants, setRestaurants] = useState<string[]>([]);

  useEffect(() => {
    fetch(
      `http://localhost:8080/api/votes/${localStorage.getItem("roomCode")}`,
      {
        headers: { "Content-Type": "application/json" },
        method: "GET",
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => setRestaurants(data.commonVotes))
      .catch((err) => console.error("Error fetching votes:", err));
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        py: 4,
      }}
    >
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        HERE ARE YOUR PLACES TO EAT
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Grid
          container
          spacing={{ xs: 4, md: 3 }}
          columns={{ xs: 4, sm: 4, md: 8 }}
          justifyContent={"center"}
        >
          {restaurants.map((restaurant) => (
            <Grid key={restaurant} size="auto">
              <Card
                key={`${restaurant}`}
                sx={{ width: 400, borderRadius: 3, boxShadow: 4 }}
              >
                <CardContent>
                  <Typography variant="h5" fontWeight="bold">
                    {restaurant}
                  </Typography>
                  <Box>
                    <Divider sx={{ my: 1 }} />

                    <Box
                      component="iframe"
                      width="100%"
                      height="150"
                      sx={{ borderRadius: 1, border: 0 }}
                      src={`https://www.google.com/maps?q=${encodeURIComponent(
                        restaurant
                      )}&z=9&output=embed`}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default Results;
