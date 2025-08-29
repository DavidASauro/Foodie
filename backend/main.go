package main

import (
	"time"

	"github.com/DavidASauro/Foodie/backend/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"https://foodie.pages.dev"}, // frontend URL
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    }))

    routes.CreateRoomRoutes(r)
    routes.RegisterWebSocketRoutes(r)
    routes.RegisterRoomRoutes(r)

    r.Run(":8080")
}


