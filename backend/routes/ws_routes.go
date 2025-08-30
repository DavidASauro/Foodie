package routes

import (
	"github.com/DavidASauro/Foodie/backend/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterWebSocketRoutes(router *gin.Engine){
	router.GET("/ws/:roomCode", handlers.HandleWebSocket)
}