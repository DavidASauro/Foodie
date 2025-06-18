package utils

import (
	"backend/models"
	"math/rand"
	"os"

	geojson "github.com/paulmach/go.geojson"
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

// loralei is the bestest :)

func ParseGeoJSONCategories(path string) (map[string][]*geojson.Feature, error) {
	data, err := os.ReadFile(path)
	if err != nil{
		return nil, err
	}

	fc, err := geojson.UnmarshalFeatureCollection(data)
	if err != nil {
		return nil, err
	}
	categorizedFeatures := make(map[string][]*geojson.Feature)
	for _, feature := range fc.Features {
		category, ok := feature.Properties["cuisine"].(string)
		if !ok{
			continue
		}
		categorizedFeatures[category] = append(categorizedFeatures[category], feature)
	}
	return categorizedFeatures, nil
}

func GetRestaurantsByCuisineType(cuisineType []string, categorizedFeatures map[string][] *geojson.Feature) (map[string][]*geojson.Feature, error) {
	restaurants := make(map[string][]*geojson.Feature)
	for _, cuisine := range cuisineType{
		if features, exists := categorizedFeatures[cuisine]; exists {

			restaurants[cuisine] = features
		}
	}
	return restaurants, nil
}

func GetCuisineTypes(categorizedFeatures map[string][] *geojson.Feature) []string {
	cuisineTypes := make([]string, 0, len(categorizedFeatures))
	for _, cuisine := range categorizedFeatures {
		cuisineTypes = append(cuisineTypes, cuisine[0].Properties["cuisine"].(string))
	}
	return cuisineTypes 

}

