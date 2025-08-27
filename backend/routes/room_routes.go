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
		roomGroup.DELETE("/delete/:roomCode", handlers.DeleteRoomHandler)
		
	}
}

func RegisterRoomRoutes(router *gin.Engine){
	router.GET("/api/cuisines", handlers.GetCuisineTypesHandler)
	router.POST("/api/restaurants", handlers.GetRestaurantsBasedOnRoomPreferences)
	router.POST("/api/votes/send", handlers.SubmitVoteHandler)
	router.GET("/api/votes/:roomCode", handlers.GetCommonRoomRestaurantVotes)
}