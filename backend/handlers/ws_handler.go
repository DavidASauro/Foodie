package handlers

import (
	"log"
	"net/http"
	"strconv"

	"github.com/DavidASauro/Foodie/backend/models"

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
	roomCode := c.Param("roomCode")
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

	username := c.Query("username")
	room.Users[username] = true

	defer func() {
		delete(room.Connections, conn)
		delete(room.Users, username)		
		conn.Close()
		log.Printf("Connection closed for user %s in room %s", username, roomCode)
		for other := range room.Connections{
			other.WriteJSON(map[string]string{"type":"roomDeleted"})
			other.Close()
			delete(room.Connections, other)
		}
		delete(models.RoomStore, roomCode)
	}()

	for{
		var msg map[string]interface{}
		if err := conn.ReadJSON(&msg); err != nil{
			log.Println("error reading message:", err)
			break
		}


		msgType, ok := msg["type"].(string)
		if !ok {
			log.Println("invalid message type")
		}
		username, ok := msg["username"].(string)
		if !ok {
			log.Println("Invalid username in message")

		}

		switch msgType {
			case "ready":
				if room.CurrentStep != 1 {
					log.Println("Unexpected 'ready' at step", room.CurrentStep)
					break
				}
				room.ProgressState[username] = true

				if len(room.ProgressState) == room.ExpectedUserCount {
					room.CurrentStep = 2
					room.ProgressState = make(map[string]bool)
					for conn := range room.Connections {
						conn.WriteJSON(map[string]interface{}{
							"type": "stepAdvanced",
							"step": room.CurrentStep,
						})
					}
				}
			case "preferences":
				if room.CurrentStep != 2 {
					log.Println("Invalid step: got preferences at step", room.CurrentStep)
					continue
				}
				prefRAW, ok := msg["preferences"].(map[string]interface{})
				if !ok{
					log.Println("Invalid preferences message format")
					continue
				}
				prefs := make(map[string]bool)
				for key, val := range prefRAW {
					if strVal, ok := val.(bool); ok{
						prefs[key] = strVal
					}
				}
				room.Preferences[username] = prefs
				handleStepCompleted(room, username)
			case "votes":
				if room.CurrentStep != 3 {
					log.Println("Invalid step: got voting at step", room.CurrentStep)
					continue
				}
				handleStepCompleted(room, username)
			case "results":
				results := models.GetUnanimousVotes(room)
				conn.WriteJSON(map[string]interface{}{
					"type": "results",
					"results": results,
				})
			case "stepCompleted":
				handleStepCompleted(room, username)
		}

		if msgType != "preferences" && msgType != "votes" && msgType != "stepCompleted" && msgType != "results" && msgType != "ready" && msgType != "details" {
			for other := range room.Connections {
				if other != conn {
					if err := other.WriteJSON(msg); err != nil {
						log.Println("error sending message:", err)
						other.Close()
						delete(room.Connections, other)
					}
				}
			}
		}
	}
}

func handleStepCompleted(room *models.Room, userID string){
	if room.ProgressState[userID] {
		log.Printf("User already completed step")
		return
	}
	room.ProgressState[userID] = true

	allDone := true
	for id := range room.Users {
		if !room.ProgressState[id]{
			allDone = false
			break
		}
	}

	if allDone{
		room.CurrentStep++
		room.ProgressState = make(map[string]bool) // reset for next step

		for conn := range room.Connections{
			conn.WriteJSON(map[string]interface{}{
				"type": "stepAdvanced",
				"step": room.CurrentStep,
				"message": "All users completed step " + strconv.Itoa(room.CurrentStep - 1),
			})
		}

		
	}
}