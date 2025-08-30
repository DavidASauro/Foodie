package main

import (
	"os"
	"time"

	"github.com/DavidASauro/Foodie/backend/routes"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
    r := gin.Default()

    r.Use(cors.New(cors.Config{
        AllowOrigins:     []string{"https://foooodie.pages.dev"}, // frontend URL
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        MaxAge:           12 * time.Hour,
    }))

    routes.CreateRoomRoutes(r)
    routes.RegisterWebSocketRoutes(r)
    routes.RegisterRoomRoutes(r)

    // Use the Render-provided PORT environment variable if available
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // fallback for local dev
	}

	r.Run(":" + port)
}


