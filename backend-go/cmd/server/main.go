package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"pbgui-backend/internal/api/handlers"
	"pbgui-backend/internal/api/routes"
	"pbgui-backend/internal/models"
	"pbgui-backend/internal/services/passivbot"
	"pbgui-backend/pkg/config"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := gorm.Open(sqlite.Open("pbgui.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto-migrate models
	db.AutoMigrate(&models.Instance{}, &models.Job{}, &models.VPSServer{})

	// Initialize services
	pbRunner := passivbot.NewRunner(cfg.PassivbotPath, cfg.PythonPath)
	
	// Initialize handlers
	handlers := &handlers.Handlers{
		DB:       db,
		PBRunner: pbRunner,
		Config:   cfg,
	}

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"*"},
		AllowCredentials: true,
	}))

	// Setup routes
	routes.SetupRoutes(r, handlers)

	// Start server
	log.Printf("Server starting on port %s", cfg.Port)
	log.Fatal(http.ListenAndServe(":"+cfg.Port, r))
}
