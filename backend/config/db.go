package config

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

// DB is the global database connection to the PostgresSQL database.
var DB *sql.DB

func ConnectDB(){
	err := godotenv.Load()
	if err != nil{
		log.Fatal("Error loading the .env file")
	}

	db, err := sql.Open("postgres", os.Getenv("DB_URL"))
	if err != nil{
		log.Fatal(err)
	}
	ping := db.Ping()
	if ping != nil{
		log.Fatal(ping)
	}
	DB = db
	log.Println("Connected to the database successfully")	
}