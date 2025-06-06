package models

import (
	"github.com/gorilla/websocket"
)

type Room struct  {
	RoomCode string
	Users map[string]bool
	Votes map[string]map[string]bool
	Connections map[*websocket.Conn]bool
}

var RoomStore = make(map[string]*Room)

func NewRoom(code string) *Room {
	return &Room{
		RoomCode: code,
		Users: make(map[string]bool),
		Connections: make(map[*websocket.Conn]bool),
	}
}