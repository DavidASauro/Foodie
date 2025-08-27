package handlers

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/DavidASauro/Foodie/backend/models"

	"github.com/gin-gonic/gin"
)

func setUpRouter() *gin.Engine {
	gin.SetMode(gin.TestMode)
	router := gin.Default()
	router.POST("/join", JoinRoomHandler)
	router.POST("/createRoom", CreateRoomHandler)
	return router
}

func TestCreateRoomHandler(t *testing.T) {
	router := setUpRouter()
	req, _ := http.NewRequest("POST", "/createRoom", nil)
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected 200 OK, got %d", w.Code)
	}

	resp := make(map[string]string)
	err := json.NewDecoder(w.Body).Decode(&resp)
	if err != nil{
		t.Fatalf("Failed to decode JSON response: %v", err)
	}

	roomCode, ok := resp["room_code"]
	if !ok || roomCode == ""{
		t.Fatalf("Response JSON missing or empty room_code")
	}

	if _, exists := models.RoomStore[roomCode]; !exists{
		t.Fatalf("RoomStore does not contain the created room with code: %s", roomCode)
	}

}

func TestJoinRoomHandler(t *testing.T){
	models.RoomStore = make(map[string]*models.Room)
	router := setUpRouter()

	

	roomCode := "test123"
    models.RoomStore[roomCode] = &models.Room{
		RoomCode: roomCode,
		Users: map[string]bool{"alice": true},
	}

	body := `{"room_code":"test123", "username":"alice"}`
	req ,_ := http.NewRequest("POST", "/join", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK{
		t.Errorf("Expected 200 OK, got %d", w.Code)
	}
}

func TestJoinRoomHandler_InvalidJSON(t *testing.T){
	models.RoomStore = make(map[string]*models.Room)
	router := setUpRouter()

	//Invalid JSON body
	body := `{"bad_field":"value"}`
	req, _ := http.NewRequest("POST", "/join", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest{
		t.Errorf("Expected 400 Bad Request, got %d", w.Code)
	}

}

func TestJoinRoomHandler_InvalidRoom(t *testing.T){
	models.RoomStore = make(map[string]*models.Room)
	router := setUpRouter()

	models.RoomStore["123"] = &models.Room{
		RoomCode: "123",
		Users:make(map[string]bool),
	}

	body := `{"room_code": "123456", "username": "alice"}`
	req, _ := http.NewRequest("POST", "/join", bytes.NewBufferString(body))
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound{
		t.Errorf("Expected 404 Not Found, got %d", w.Code)
	}

	
}