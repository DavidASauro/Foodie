package handlers

import (
	"backend/models"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	//Allowing all origins for simplicity, but can be restricted later.
	CheckOrigin: func(r *http.Request) bool{
		return true
	},
}

func HandleWebSocket(c *gin.Context){
	roomCode := c.Param("room_code")
	conn, err := upgrader.Upgrade(c.Writer,c.Request,nil)
	if err != nil{
		log.Println(err)
		return
	}

	room, exists := models.RoomStore[roomCode]

	if !exists {
		conn.WriteJSON(map[string]string{"Error": "Room not found"})
		conn.Close()
		return
	}

	room.Connections[conn] = true

	defer func() {
		delete(room.Connections, conn)
		conn.Close()
	}()

	for{
		var msg map[string]string
		if err := conn.ReadJSON(&msg); err != nil{
			log.Println("error reading message:", err)
			break
		}

		for other := range room.Connections{
			if other != conn{
				if err := other.WriteJSON(msg); err != nil{
					log.Println("error sending message:", err)
					other.Close()
					delete(room.Connections, other)
				}
			}
		}
	}
}