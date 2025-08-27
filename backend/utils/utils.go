package utils

import (
	"math/rand"
	"os"
	"sort"
	"strings"

	"github.com/DavidASauro/Foodie/backend/models"

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
    
    // Asian        
    "chinese": "Asian", "sushi": "Asian", "thai": "Asian", "korean": "Asian",
	"vietnamese": "Asian", "japanese": "Asian", "noodles": "Asian", "dumplings": "Asian",
	"ramen": "Asian", "indian": "Asian", "tibetan": "Asian", "nepalese": "Asian",
	"filipino": "Asian", "poke": "Asian", "bangladeshi": "Asian", "cantonese": "Asian",
	"malaysian": "Asian", "indonesian": "Asian", "asian": "Asian", "lao": "Asian",
	"taiwanese": "Asian", "peshawari": "Asian", "hawaiian": "Asian",

	// European
	"french": "European", "italian": "European", "pizza": "European", "greek": "European", "german": "European",
	"british": "European", "spanish": "European", "russian": "European", "belgian": "European",
	"swiss": "European", "ukrainian": "European", "polish": "European", "portuguese": "European",
	"hungarian": "European", "georgian": "European", "bavarian": "European", "breton": "European",
	"european": "European", "romanian": "European",

	// Middle Eastern
	"lebanese": "Middle Eastern", "turkish": "Middle Eastern", "persian": "Middle Eastern",
	"israeli": "Middle Eastern", "syrian": "Middle Eastern", "yemeni": "Middle Eastern",
	"arab": "Middle Eastern", "shawarma": "Middle Eastern", "falafel": "Middle Eastern",
	"kebab": "Middle Eastern", "afghan": "Middle Eastern", "couscous": "Middle Eastern",
	"middle_eastern": "Middle Eastern",

	// North American
	"american": "North American", "canadian": "North American", "southern": "North American",
	"burger": "North American", "barbecue": "North American", "poutine": "North American",
	"quebecois": "North American", "fried_food": "North American", "local": "North American",
	"regional": "North American",

	// Latin American / Caribbean
	"mexican": "Latin American", "brazilian": "Latin American", "argentinian": "Latin American",
	"cuban": "Latin American", "peruvian": "Latin American", "colombian": "Latin American",
	"venezuelan": "Latin American", "chilean": "Latin American", "jamaican": "Latin American",
	"haitian": "Latin American", "salvadoran": "Latin American", "pupusa": "Latin American",
	"empanada": "Latin American", "tacos": "Latin American", "taqueria": "Latin American",
	"tex-mex": "Latin American", "arepa": "Latin American", "latin_american": "Latin American",

	// African
	"ethiopian": "African", "senegalese": "African", "somali": "African",
	"north_african": "African", "algerian": "African", "moroccan": "African",
	"tunisian": "African", "caribbean": "African", "mauritian": "African",
	"african": "African", "creole": "African",

	// Other / General
	//"chicken": "Other", "fusion": "Other", "international": "Other",
	//"comfort": "Other", "fine_dining": "Other", "brunch": "Other", "breakfast": "Other",
	//"lunch": "Other", "supper": "Other", "salad": "Other", "organic": "Other",
	//"soup": "Other", "smoked_salmon": "Other", "fried": "Other",

    
    }

    grouped := make(map[string][]string)

    for _, cuisine := range uniqueCuisines {
        category, ok := cuisineCategories[cuisine]
        if !ok {
            continue;   
        }
        grouped[category] = append(grouped[category], cuisine)
    }

    return grouped
}



