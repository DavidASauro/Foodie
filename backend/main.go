package main

import (
	"github.com/DavidASauro/Foodie/backend/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	//config.ConnectDB()

	r := gin.Default()

	//CORS middleware
	r.Use(func(c *gin.Context) {
        c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
        c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
        c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        c.Next()
    })

	//Adding routes
	routes.CreateRoomRoutes(r)
	routes.RegisterWebSocketRoutes(r)
	routes.RegisterRoomRoutes(r)

	r.Run(":8080")
}

