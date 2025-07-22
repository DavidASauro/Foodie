import { useEffect } from "react";
import { useState } from "react";

const Results = () => {
  const [restaurants, setRestaurants] = useState([]);
  useEffect(() => {
    fetch(
      `http://localhost:8080/api/votes/${localStorage.getItem("roomCode")}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        method: "GET",
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setRestaurants(data.commonVotes);
      });
  }, []);

  return (
    <div>
      <h2>Common Votes</h2>
      <ul>
        {restaurants.map((restaurant, index) => (
          <li key={index}>{restaurant}</li>
        ))}
      </ul>
    </div>
  );
};

export default Results;
