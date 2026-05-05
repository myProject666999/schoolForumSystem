package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	ServerPort   string
	DBHost       string
	DBPort       string
	DBUser       string
	DBPassword   string
	DBName       string
	JWTSecret    string
	JWTExpireHours int
	FrontendURL  string
}

var AppConfig *Config

func LoadConfig() error {
	_ = godotenv.Load()

	AppConfig = &Config{
		ServerPort:   getEnv("SERVER_PORT", "8080"),
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       getEnv("DB_PORT", "3306"),
		DBUser:       getEnv("DB_USER", "root"),
		DBPassword:   getEnv("DB_PASSWORD", ""),
		DBName:       getEnv("DB_NAME", "school_forum"),
		JWTSecret:    getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpireHours: getEnvAsInt("JWT_EXPIRE_HOURS", 24),
		FrontendURL:  getEnv("FRONTEND_URL", "http://localhost:3000"),
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value, exists := os.LookupEnv(key); exists {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
