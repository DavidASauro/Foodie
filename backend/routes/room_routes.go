package routes

import (
	"github.com/gin-gonic/gin"

	"backend/handlers"
)

func CreateRoomRoutes(router *gin.Engine){
	roomGroup := router.Group("/api/room")
	{
		roomGroup.POST("/createRoom", handlers.CreateRoomHandler)
		roomGroup.POST("/join", handlers.JoinRoomHandler)
		roomGroup.GET("/status/:roomCode", handlers.GetRoomStatusHandler)
	}
}