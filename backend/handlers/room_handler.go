package handlers

import (
	"backend/models"
	"backend/utils"
	"net/http"

	"github.com/gin-gonic/gin"
)

type JoinRequest struct{
	Code string `json:"room_code"`
	Username string `json:"username"`
}


func CreateRoomHandler(c *gin.Context){
	roomCode := utils.GenerateCode()
	room := models.NewRoom(roomCode)
	models.RoomStore[roomCode] = room
	c.JSON(http.StatusOK, gin.H{"room_code":roomCode})
	
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
	c.JSON(http.StatusOK, gin.H{"message": "joined room successfully", "room_code": room.RoomCode, "users": room.Users})
}
