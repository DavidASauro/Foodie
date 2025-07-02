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
