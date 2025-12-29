package config

import (
	"os"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI      string
	MongoDB       string
	JWTSecret     string
	JWTExpiry     time.Duration
	Port          string
	AdminEmail    string
	AdminPassword string
}

var AppConfig *Config

func LoadConfig() (*Config, error) {
	godotenv.Load()

	expiry, err := time.ParseDuration(getEnv("JWT_EXPIRY", "24h"))
	if err != nil {
		expiry = 24 * time.Hour
	}

	AppConfig = &Config{
		MongoURI:      getEnv("MONGODB_URI", "mongodb://localhost:27017"),
		MongoDB:       getEnv("MONGODB_DATABASE", "ejewel"),
		JWTSecret:     getEnv("JWT_SECRET", "default-secret-key"),
		JWTExpiry:     expiry,
		Port:          getEnv("PORT", "8080"),
		AdminEmail:    getEnv("ADMIN_EMAIL", "admin@ejewel.com"),
		AdminPassword: getEnv("ADMIN_PASSWORD", "admin123"),
	}

	return AppConfig, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

