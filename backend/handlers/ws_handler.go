package handlers

import (
	"backend/models"
	"log"
	"net/http"
	"strconv"

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

	userID := c.Query("userID") // or wherever you’re getting it from
	room.Users[userID] = true

	// Check if enough users have joined to move to Step 2
	if room.CurrentStep == 1 && len(room.Users) == room.ExpectedUserCount {
		room.CurrentStep = 2
		room.ProgressState = make(map[string]bool)
		for conn := range room.Connections {
			conn.WriteJSON(map[string]interface{}{
				"type": "stepAdvanced",
				"step": room.CurrentStep,
			})
		}
	}

	defer func() {
		delete(room.Connections, conn)
		conn.Close()
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
		userID, ok := msg["userID"].(string)
		if !ok {
			log.Println("Invalid userID in message")

		}

		switch msgType {
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
				room.Preferences[userID] = prefs
				handleStepCompleted(room, userID)
			case "votes":
				if room.CurrentStep != 3 {
					log.Println("Invalid step: got voting at step", room.CurrentStep)
					continue
				}
				rawVotes, ok := msg["votes"].(map[string]interface{})
				if !ok{
					log.Println("Invalid votes message format")
					continue
				}
				parsedVotes := make(map[string]bool)
				for placeID, val := range rawVotes{
					if voted, ok := val.(bool); ok{
						parsedVotes[placeID] = voted
					}
				}
				room.Votes[userID] = parsedVotes
				handleStepCompleted(room, userID)
			case "results":
				results := models.GetUnanimousVotes(room)
				conn.WriteJSON(map[string]interface{}{
					"type": "results",
					"results": results,
				})
			case "stepCompleted":
				handleStepCompleted(room, userID)
		}

		if msgType != "preferences" && msgType != "voting" && msgType != "stepCompleted" {
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
		room.ProgressState = make(map[string]bool)

		for conn := range room.Connections{
			conn.WriteJSON(map[string]interface{}{
				"type": "stepAdvanced",
				"message": "All users completed step " + strconv.Itoa(room.CurrentStep),
			})
		}
	}
}