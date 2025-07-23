package handlers

import (
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type JoinRequest struct{
	Code string `json:"roomCode" binding:"required"`
	Username string `json:"username" binding:"required"`
}

type PreferencesRequest struct {
	Cuisines []string `json:"cuisines"`
}

type VoteRequest struct {
    RoomCode string            `json:"roomCode"`
    Username string            `json:"username"`
    Votes    map[string]bool    `json:"nextVotes"` // Restaurant name to yes/no
}


func CreateRoomHandler(c *gin.Context){
	var req struct {
		Username string `json:"username" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	roomCode := utils.GenerateCode()
	room := models.NewRoom(roomCode)
	room.Users[req.Username] = true
	models.RoomStore[roomCode] = room
	c.JSON(http.StatusOK, gin.H{"roomCode":roomCode})
}

func JoinRoomHandler(c *gin.Context){
	var joinReq JoinRequest
	if err := c.ShouldBindJSON(&joinReq); err!= nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	room, exists := models.RoomStore[joinReq.Code]
	if !exists{
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}

	room.Users[joinReq.Username] = true
	c.JSON(http.StatusOK, gin.H{"message": "joined room successfully", "roomCode": room.RoomCode, "users": room.Users})
}

func GetRoomStatusHandler(c *gin.Context){
	roomCode := c.Param("roomCode")
	room, exists := models.RoomStore[roomCode]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}

	numOfPeopleInRoom := len(room.Users)
	c.JSON(http.StatusOK, gin.H{
		"roomCode": room.RoomCode,
		"users": room.Users,
		"ready": numOfPeopleInRoom == room.ExpectedUserCount,
		"readyToConnect": numOfPeopleInRoom == room.ExpectedUserCount,
	})
}

func GetCuisineTypesHandler(c *gin.Context){
	categorizedFeatures, err := utils.ParseGeoJSONCategories("data/restaurants.geojson")
	if err != nil{
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse geojson"})
		return
	}
	cuisineType := utils.GetUniqueCuisineTypes(categorizedFeatures)
	groupedCuisines := utils.GroupCuisinesByCategory(cuisineType)
	c.JSON(http.StatusOK, gin.H{"cuisineTypes": groupedCuisines})
}


func GetRestaurantsBasedOnRoomPreferences(c *gin.Context) {
	roomCode := c.Query("roomCode") // ?roomCode=XXXXXX

	room, exists := models.RoomStore[roomCode]
	if !exists {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}

	selectedCuisines := models.CollectRoomPreferences(room)

	categorizedFeatures, err := utils.ParseGeoJSONCategories("data/restaurants.geojson")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to parse geojson"})
		return
	}

	restaurantsByCuisine, _ := utils.GetRestaurantsByCuisineType(selectedCuisines, categorizedFeatures)

	type Restaurant struct {
		Name    string  `json:"name"`
		Cuisine string  `json:"cuisine"`
		Lat     float64 `json:"lat"`
		Lng     float64 `json:"lng"`
	}

	var response []Restaurant

	for cuisine, features := range restaurantsByCuisine {
		for _, feature := range features {
			name, ok := feature.Properties["name"].(string)
			if !ok {
				name = "Unknown"
			}

			response = append(response, Restaurant{
				Name:    name,
				Cuisine: cuisine,
				Lat:     feature.Geometry.Point[1],
				Lng:     feature.Geometry.Point[0],
			})
		}
	}

	c.JSON(200, gin.H{"restaurants": response})
}

func GetCommonRoomRestaurantVotes(c *gin.Context){
	roomCode := c.Param("roomCode")
	room, exits := models.RoomStore[roomCode]
	if !exits {
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}
	if room.Votes == nil {
		c.JSON(http.StatusOK, gin.H{"message": "no votes yet"})
		return
	}

	commonVotes := map[string]bool{}
	first := true
	for _, votes := range room.Votes{
		currentUserVotes := map[string]bool{}
		for restaurant, vote := range votes{
			if vote {
				currentUserVotes[restaurant] = true
			}
		}
		if first {
			for k := range currentUserVotes {
                commonVotes[k] = true
            }
			first = false
		}else{
			var toRemove []string
			for k := range commonVotes {
				if !currentUserVotes[k] {
					toRemove = append(toRemove,k)
				}
			}
			for _, k := range toRemove {
				delete(commonVotes, k)
			}
		}
	}
	results := []string{}
	for restaurant := range commonVotes {
		results = append(results, restaurant)
	}
	c.JSON(http.StatusOK, gin.H{"commonVotes": results})
}

func SubmitVoteHandler(c *gin.Context){
	var voteReq VoteRequest
	if err := c.ShouldBindJSON(&voteReq); err != nil{
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	room,exists := models.RoomStore[voteReq.RoomCode]

	if !exists{
		c.JSON(http.StatusNotFound, gin.H{"error": "room not found"})
		return
	}

	if room.Votes == nil {
		room.Votes = make(map[string]map[string]bool)
	}

	room.Votes[voteReq.Username] = voteReq.Votes

	c.JSON(http.StatusOK, gin.H{
		"message": "votes submitted successfully"})
}

