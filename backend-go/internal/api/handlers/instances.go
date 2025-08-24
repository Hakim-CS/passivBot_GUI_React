package handlers

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"

	"pbgui-backend/internal/models"
	"pbgui-backend/internal/services/passivbot"
	"pbgui-backend/pkg/config"
)

type Handlers struct {
	DB       *gorm.DB
	PBRunner *passivbot.Runner
	Config   *config.Config
}

// Instance Management Handlers

func (h *Handlers) GetInstances(c *gin.Context) {
	var instances []models.Instance
	if err := h.DB.Find(&instances).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, instances)
}

func (h *Handlers) CreateInstance(c *gin.Context) {
	var instance models.Instance
	if err := c.ShouldBindJSON(&instance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	instance.ID = uuid.New().String()
	instance.Status = "stopped"
	instance.CreatedAt = time.Now()
	instance.UpdatedAt = time.Now()

	if err := h.DB.Create(&instance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, instance)
}

func (h *Handlers) GetInstance(c *gin.Context) {
	id := c.Param("id")
	var instance models.Instance
	
	if err := h.DB.First(&instance, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}
	
	c.JSON(http.StatusOK, instance)
}

func (h *Handlers) UpdateInstance(c *gin.Context) {
	id := c.Param("id")
	var instance models.Instance
	
	if err := h.DB.First(&instance, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	if err := c.ShouldBindJSON(&instance); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	instance.UpdatedAt = time.Now()
	if err := h.DB.Save(&instance).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, instance)
}

func (h *Handlers) DeleteInstance(c *gin.Context) {
	id := c.Param("id")
	
	// First stop the instance if running
	h.StopInstance(c)
	
	if err := h.DB.Delete(&models.Instance{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Instance deleted"})
}

func (h *Handlers) StartInstance(c *gin.Context) {
	id := c.Param("id")
	var instance models.Instance
	
	if err := h.DB.First(&instance, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	// Start the instance using PBRunner
	if err := h.PBRunner.Start(instance); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Update status
	instance.Status = "running"
	instance.UpdatedAt = time.Now()
	h.DB.Save(&instance)

	c.JSON(http.StatusOK, gin.H{"message": "Instance started", "status": "running"})
}

func (h *Handlers) StopInstance(c *gin.Context) {
	id := c.Param("id")
	var instance models.Instance
	
	if err := h.DB.First(&instance, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Instance not found"})
		return
	}

	// Stop the instance using PBRunner
	if err := h.PBRunner.Stop(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Update status
	instance.Status = "stopped"
	instance.UpdatedAt = time.Now()
	h.DB.Save(&instance)

	c.JSON(http.StatusOK, gin.H{"message": "Instance stopped", "status": "stopped"})
}

// Dashboard Handlers

func (h *Handlers) GetDashboardStats(c *gin.Context) {
	var totalInstances int64
	var runningInstances int64
	
	h.DB.Model(&models.Instance{}).Count(&totalInstances)
	h.DB.Model(&models.Instance{}).Where("status = ?", "running").Count(&runningInstances)

	var totalPNL float64
	h.DB.Model(&models.Instance{}).Select("COALESCE(SUM(pnl), 0)").Scan(&totalPNL)

	stats := models.DashboardStats{
		TotalInstances:   int(totalInstances),
		RunningInstances: int(runningInstances),
		TotalPNL:         totalPNL,
		DailyPNL:         0, // TODO: Calculate daily PNL
		ActiveJobs:       0, // TODO: Count active jobs
		SystemUptime:     "24h 30m", // TODO: Calculate real uptime
	}

	c.JSON(http.StatusOK, stats)
}
