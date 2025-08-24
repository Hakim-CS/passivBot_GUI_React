package config

import (
	"os"
	"strconv"
)

type Config struct {
	Port          string
	DatabaseURL   string
	PassivbotPath string
	PythonPath    string
	RedisURL      string
	LogLevel      string
	Environment   string
}

func Load() *Config {
	return &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DATABASE_URL", "pbgui.db"),
		PassivbotPath: getEnv("PASSIVBOT_PATH", "/opt/passivbot"),
		PythonPath:    getEnv("PYTHON_PATH", "python3"),
		RedisURL:      getEnv("REDIS_URL", "redis://localhost:6379"),
		LogLevel:      getEnv("LOG_LEVEL", "info"),
		Environment:   getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}

func getEnvAsBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if boolVal, err := strconv.ParseBool(value); err == nil {
			return boolVal
		}
	}
	return defaultValue
}
