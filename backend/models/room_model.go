package models

import (
	"github.com/gorilla/websocket"
)

type Room struct  {
	RoomCode string
	Users map[string]bool
	Votes map[string]map[string]bool
	Preferences map[string]map[string]bool
	Connections map[*websocket.Conn]bool
	ProgressState map[string]bool
	CurrentStep int
	ExpectedUserCount int
}

var RoomStore = make(map[string]*Room)

func NewRoom(code string) *Room {
	return &Room{
		RoomCode:     code,
		Users:        make(map[string]bool),
		Votes:        make(map[string]map[string]bool),
		Preferences:  make(map[string]map[string]bool),
		Connections:  make(map[*websocket.Conn]bool),
		ProgressState: make(map[string]bool),
		CurrentStep:  1,
		ExpectedUserCount: 2,
	}
}

func GetUnanimousVotes(room *Room) []string {
	if len(room.Votes) == 0{
		return []string{}
	}
	var intersection map[string]bool
	first := true

	for _, votes := range room.Votes {
		if len(votes) == 0{
			continue
		}
		if first {
			intersection = make(map[string]bool)
			for placeID, liked := range votes {
				if liked{
					intersection[placeID] = true
				}
			}
			first = false
			continue
		}

		for placeID := range intersection {
			if !votes[placeID] {
				delete(intersection, placeID)
			}

		}
	}
	unanimousVotes := make([]string,0,len(intersection))
	for placeID := range intersection {
		unanimousVotes = append(unanimousVotes, placeID)
	}

	return unanimousVotes
}

// Collect all selected cuisines from all users in the room
func CollectRoomPreferences(room *Room) []string {
    cuisineSet := make(map[string]struct{})

    for _, userPrefs := range room.Preferences {
        for cuisine, selected := range userPrefs {
            if selected {
                cuisineSet[cuisine] = struct{}{}
            }
        }
    }

    cuisines := make([]string, 0, len(cuisineSet))
    for cuisine := range cuisineSet {
        cuisines = append(cuisines, cuisine)
    }

    return cuisines
}

