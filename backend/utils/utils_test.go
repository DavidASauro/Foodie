package utils

import (
	"slices"
	"testing"
)

func TestGenerateCode(t *testing.T){
	alpha := []rune("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ")
	code := GenerateCode()

	// Check if the generated code is exactly 6 characters long
	if len(code) != 6{
		t.Errorf("Expected room code length of 6, got %d", len(code))
	}

	// Check if all characters in the generated code are from the allowed set
	for _, char := range code {
		found := slices.Contains(alpha, char)
		if !found {
			t.Errorf("Generated code contains invalid character: %c", char)
		}
	}

}