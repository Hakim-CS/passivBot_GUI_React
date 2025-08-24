package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"pbgui-backend/internal/models"
)

// VPS Management Handlers

func (h *Handlers) GetVPSServers(c *gin.Context) {
	var servers []models.VPSServer
	if err := h.DB.Find(&servers).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, servers)
}

func (h *Handlers) CreateVPSServer(c *gin.Context) {
	var server models.VPSServer
	if err := c.ShouldBindJSON(&server); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	server.ID = uuid.New().String()
	server.Status = "offline"
	server.CreatedAt = time.Now()
	server.UpdatedAt = time.Now()

	if err := h.DB.Create(&server).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, server)
}

func (h *Handlers) UpdateVPSServer(c *gin.Context) {
	id := c.Param("id")
	var server models.VPSServer
	
	if err := h.DB.First(&server, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Server not found"})
		return
	}

	if err := c.ShouldBindJSON(&server); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	server.UpdatedAt = time.Now()
	if err := h.DB.Save(&server).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, server)
}

func (h *Handlers) DeleteVPSServer(c *gin.Context) {
	id := c.Param("id")
	
	if err := h.DB.Delete(&models.VPSServer{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Server deleted"})
}

func (h *Handlers) DeployToVPS(c *gin.Context) {
	id := c.Param("id")
	var server models.VPSServer
	
	if err := h.DB.First(&server, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Server not found"})
		return
	}

	// Mock deployment process
	server.Status = "deploying"
	h.DB.Save(&server)

	// Simulate deployment in goroutine
	go func() {
		time.Sleep(5 * time.Second)
		server.Status = "online"
		server.UpdatedAt = time.Now()
		h.DB.Save(&server)
	}()

	c.JSON(http.StatusOK, gin.H{
		"message": "Deployment started",
		"status":  "deploying",
	})
}

func (h *Handlers) GetVPSStatus(c *gin.Context) {
	id := c.Param("id")
	var server models.VPSServer
	
	if err := h.DB.First(&server, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Server not found"})
		return
	}

	// Mock resource monitoring
	status := map[string]interface{}{
		"status": server.Status,
		"cpu":    server.CPU,
		"memory": server.Memory,
		"disk":   server.Disk,
		"uptime": "24h 15m",
		"last_seen": time.Now().Add(-2 * time.Minute),
	}

	c.JSON(http.StatusOK, status)
}

// Remote Sync Handlers

func (h *Handlers) TriggerSync(c *gin.Context) {
	// Mock sync operation
	c.JSON(http.StatusOK, gin.H{
		"message":  "Sync started",
		"sync_id":  uuid.New().String(),
		"status":   "running",
		"started_at": time.Now(),
	})
}

func (h *Handlers) GetSyncStatus(c *gin.Context) {
	// Mock sync status
	status := map[string]interface{}{
		"status":     "completed",
		"last_sync":  time.Now().Add(-10 * time.Minute),
		"files_synced": 25,
		"bytes_transferred": 1024 * 1024 * 15, // 15MB
		"duration":   "45s",
	}

	c.JSON(http.StatusOK, status)
}

func (h *Handlers) UpdateSyncConfig(c *gin.Context) {
	var config map[string]interface{}
	if err := c.ShouldBindJSON(&config); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock config update
	c.JSON(http.StatusOK, gin.H{
		"message": "Sync configuration updated",
		"config":  config,
	})
}

// Settings Handlers

func (h *Handlers) GetSettings(c *gin.Context) {
	settings := map[string]interface{}{
		"passivbot_path": h.Config.PassivbotPath,
		"python_path":    h.Config.PythonPath,
		"log_level":      h.Config.LogLevel,
		"environment":    h.Config.Environment,
		"auto_backup":    true,
		"theme":          "dark",
		"notifications":  map[string]bool{
			"email":    false,
			"slack":    false,
			"discord":  false,
			"telegram": false,
		},
	}

	c.JSON(http.StatusOK, settings)
}

func (h *Handlers) UpdateSettings(c *gin.Context) {
	var settings map[string]interface{}
	if err := c.ShouldBindJSON(&settings); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock settings update
	c.JSON(http.StatusOK, gin.H{
		"message":  "Settings updated",
		"settings": settings,
	})
}

func (h *Handlers) GetPaths(c *gin.Context) {
	paths := map[string]string{
		"passivbot_path": h.Config.PassivbotPath,
		"python_path":    h.Config.PythonPath,
		"data_directory": "/opt/pbgui/data",
		"logs_directory": "/opt/pbgui/logs",
	}

	c.JSON(http.StatusOK, paths)
}

func (h *Handlers) UpdatePaths(c *gin.Context) {
	var paths map[string]string
	if err := c.ShouldBindJSON(&paths); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Mock path update
	c.JSON(http.StatusOK, gin.H{
		"message": "Paths updated",
		"paths":   paths,
	})
}

// Performance handler

func (h *Handlers) GetPerformance(c *gin.Context) {
	// Mock performance data
	performance := map[string]interface{}{
		"total_pnl": 1250.75,
		"daily_pnl": 45.50,
		"weekly_pnl": 178.25,
		"monthly_pnl": 892.40,
		"win_rate": 0.68,
		"sharpe_ratio": 1.85,
		"max_drawdown": -8.5,
		"active_positions": 12,
		"total_trades": 156,
		"equity_curve": []map[string]interface{}{
			{"date": "2025-08-20", "value": 1000.0},
			{"date": "2025-08-21", "value": 1025.5},
			{"date": "2025-08-22", "value": 1087.2},
			{"date": "2025-08-23", "value": 1156.8},
			{"date": "2025-08-24", "value": 1250.7},
		},
	}

	c.JSON(http.StatusOK, performance)
}
