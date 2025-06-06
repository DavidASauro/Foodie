package utils

import (
	"math/rand"
)

func GenerateCode() string {
	alpha := []rune("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
	code := make([]rune,6)

	for i := range code {
		code[i] = alpha[rand.Intn(len(alpha))]
	}
	
	//TODO: implement a check against existing room codes in the RoomStore.
	
	return string(code)

}