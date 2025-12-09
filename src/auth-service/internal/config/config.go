package cmd

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Server struct {
		Port string
	}
	DB struct {
		Host     string
		Port     string
		User     string
		Name     string
		Password string
	}
	JWT struct {
		Secret string
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}

	return defaultValue
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{}

	cfg.Server.Port = getEnv("PORT", "3000")
	cfg.DB.Host = getEnv("DB_HOST", "localhost")
	cfg.DB.Port = getEnv("DB_PORT", "5432")
	cfg.DB.User = getEnv("DB_USER", "monokkai")
	cfg.DB.Name = getEnv("DB_NAME", "auth_db")
	cfg.DB.Password = getEnv("DB_PASSWORD", "authpassword")
	cfg.JWT.Secret = getEnv("JWT_SECRET", "y7Wk+98QE1tWGl0BAi0tkqegTNcizbeew6eGDcjOmDU=")

	return cfg
}
