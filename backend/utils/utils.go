package utils

import (
	"backend/models"
	"math/rand"
	"os"
	"sort"
	"strings"

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

func GetUniqueCuisineTypes(categorizedFeatures map[string][]*geojson.Feature) []string {
    cuisineSet := make(map[string]struct{})

    for _, cuisines := range categorizedFeatures {
        for _, feature := range cuisines {
            if val, ok := feature.Properties["cuisine"].(string); ok {
                cuisineList := strings.Split(val, ";")
                for _, cuisine := range cuisineList {
                    trimmed := strings.TrimSpace(cuisine)
                    if trimmed != "" {
                        cuisineSet[trimmed] = struct{}{}
                    }
                }
            }
        }
    }

    cuisines := make([]string, 0, len(cuisineSet))
    for key := range cuisineSet {
        cuisines = append(cuisines, key)
    }

    sort.Strings(cuisines) // For nicer display in frontend dropdown
    return cuisines
}

func GroupCuisinesByCategory(uniqueCuisines []string) map[string][]string {
    cuisineCategories := map[string]string{
        "chinese": "Asian",
        "japanese": "Asian",
        "thai": "Asian",
        "korean": "Asian",
        "vietnamese": "Asian",
        "sushi": "Asian",
        "dumplings": "Asian",
        "ramen": "Asian",
        "poke": "Asian",
        "indian": "Asian",
        "pakistani": "Asian",
        "malaysian": "Asian",
        "taiwanese": "Asian",

        "french": "European",
        "italian": "European",
        "greek": "European",
        "german": "European",
        "spanish": "European",
        "polish": "European",
        "british": "European",

        "lebanese": "Middle Eastern",
        "turkish": "Middle Eastern",
        "persian": "Middle Eastern",
        "syrian": "Middle Eastern",
        "israeli": "Middle Eastern",

        "american": "North American",
        "canadian": "North American",
        "southern": "North American",
        "barbecue": "North American",
        "burger": "North American",
        "poutine": "North American",

        "mexican": "Latin American",
        "brazilian": "Latin American",
        "peruvian": "Latin American",
        "cuban": "Latin American",
        "argentinian": "Latin American",
        "venezuelan": "Latin American",

        "afghan": "Other",
        "ethiopian": "Other",
        "hawaiian": "Other",
        "fusion": "Other",
        "caribbean": "Other",
        "creole": "Other",
        "african": "Other",
    }

    grouped := make(map[string][]string)

    for _, cuisine := range uniqueCuisines {
        category, ok := cuisineCategories[cuisine]
        if !ok {
            category = "Other"
        }
        grouped[category] = append(grouped[category], cuisine)
    }

    return grouped
}


