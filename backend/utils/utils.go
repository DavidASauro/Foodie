package utils

import (
	"backend/models"
	"math/rand"
)

func GenerateCode() string {
	alpha := []rune("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
	code := make([]rune,6)

	for{
		for i := range code {
			code[i] = alpha[rand.Intn(len(alpha))]
		}
		if _,exists := models.RoomStore[string(code)]; !exists {
			return string(code)
		}
	}
	
}