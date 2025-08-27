package handlers

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/DavidASauro/Foodie/backend/models"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

func TestHandleWebSocket(t *testing.T) {
	// Prepare test server
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/ws/:room_code", HandleWebSocket)

	// Create a test room
	roomCode := "testRoom"
	models.RoomStore[roomCode] = &models.Room{
		RoomCode:    roomCode,
		Users:       map[string]bool{},
		Connections: make(map[*websocket.Conn]bool),
	}

	// Start test server
	server := httptest.NewServer(router)
	defer server.Close()

	// Create WebSocket URL (ws not http)
	wsURL := "ws" + server.URL[len("http"):] + "/ws/" + roomCode

	// Connect as WebSocket client
	dialer := websocket.DefaultDialer
	conn, resp, err := dialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket: %v (resp=%v)", err, resp)
	}
	defer conn.Close()

	// Send message
	message := map[string]string{"user": "alice", "message": "hello"}
	if err := conn.WriteJSON(message); err != nil {
		t.Fatalf("Failed to send message: %v", err)
	}

	// There should be no other clients to echo the message to, so no message received
	conn.SetReadDeadline(time.Now().Add(1 * time.Second))
	_, _, err = conn.ReadMessage()
	if websocket.IsUnexpectedCloseError(err) {
		t.Fatalf("Unexpected WebSocket close: %v", err)
	}
}

func TestHandleWebSocket_InvalidRoom(t *testing.T) {
	// Prepare test server
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/ws/:room_code", HandleWebSocket)

	// Create a test room
	roomCode := "testRoom"
	models.RoomStore[roomCode] = &models.Room{
		RoomCode:    roomCode,
		Users:       map[string]bool{},
		Connections: make(map[*websocket.Conn]bool),
	}

	// Start test server
	server := httptest.NewServer(router)
	defer server.Close()

	// Create WebSocket URL (ws not http)
	wsURL := "ws" + server.URL[len("http"):] + "/ws/" + "invalidRoom"

	// Connect as WebSocket client
	dialer := websocket.DefaultDialer
	conn, resp, err := dialer.Dial(wsURL, nil)
	if err != nil {
		t.Fatalf("Failed to connect to WebSocket: %v (resp=%v)", err, resp)
	}
	defer conn.Close()
	// Try to read the error response from server
	var msg map[string]string
	err = conn.ReadJSON(&msg)
	if err != nil {
		t.Fatalf("Failed to read JSON error message: %v", err)
	}

	// Expect error message about room not found
	expected := "Room not found"
	if msg["Error"] != expected {
		t.Errorf("Expected error message '%s', got '%s'", expected, msg["Error"])
	}

	// Verify the connection was closed by server
	_, _, err = conn.ReadMessage()
	if err == nil {
		t.Error("Expected connection to be closed by server, but it remained open")
	}

}

func TestHandleWebSocket_UpgradeFails(t *testing.T) {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.GET("/ws/:room_code", HandleWebSocket)

	// Create test HTTP server
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/ws/testRoom", nil)

	// Intentionally not setting required WebSocket headers
	// This causes upgrader.Upgrade to fail
	router.ServeHTTP(w, req)

	// The function doesn't write a response, but we can confirm no panic or crash occurred
	if w.Code != http.StatusSwitchingProtocols && w.Code != http.StatusOK {
		t.Logf("Upgrade failed as expected with HTTP status %d", w.Code)
	} else {
		t.Errorf("Expected upgrade to fail, but got status: %d", w.Code)
	}
}



