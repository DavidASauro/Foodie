package routes

import (
	"backend/handlers"

	"github.com/gin-gonic/gin"
)

func RegisterWebSocketRoutes(router *gin.Engine){
	router.GET("/api/ws/:roomCode", handlers.HandleWebSocket)
}