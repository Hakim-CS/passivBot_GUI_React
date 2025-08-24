package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"

	"pbgui-backend/internal/models"
)

// Backtest Handlers

func (h *Handlers) RunBacktest(c *gin.Context) {
	var params models.BacktestParams
	if err := c.ShouldBindJSON(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create job
	job := models.Job{
		ID:        uuid.New().String(),
		Type:      "backtest",
		Status:    "queued",
		Progress:  0,
		CreatedAt: time.Now(),
	}

	// Convert params to JSON
	paramsBytes, _ := json.Marshal(params)
	job.Params = string(paramsBytes)

	// Save job to database
	if err := h.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Start backtest in goroutine
	go h.processBacktest(&job, params)

	c.JSON(http.StatusAccepted, gin.H{
		"job_id": job.ID,
		"status": "queued",
	})
}

func (h *Handlers) GetBacktestJobs(c *gin.Context) {
	var jobs []models.Job
	if err := h.DB.Where("type = ?", "backtest").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

func (h *Handlers) GetBacktestJob(c *gin.Context) {
	id := c.Param("id")
	var job models.Job
	
	if err := h.DB.First(&job, "id = ? AND type = ?", id, "backtest").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}
	
	c.JSON(http.StatusOK, job)
}

func (h *Handlers) CancelBacktestJob(c *gin.Context) {
	id := c.Param("id")
	var job models.Job
	
	if err := h.DB.First(&job, "id = ? AND type = ?", id, "backtest").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	if job.Status == "running" || job.Status == "queued" {
		job.Status = "cancelled"
		h.DB.Save(&job)
	}

	c.JSON(http.StatusOK, gin.H{"message": "Job cancelled"})
}

func (h *Handlers) GetBacktestResults(c *gin.Context) {
	id := c.Param("id")
	var job models.Job
	
	if err := h.DB.First(&job, "id = ? AND type = ?", id, "backtest").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	if job.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Job not completed yet"})
		return
	}

	var results map[string]interface{}
	if err := json.Unmarshal([]byte(job.Results), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse results"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (h *Handlers) processBacktest(job *models.Job, params models.BacktestParams) {
	// Update job status to running
	job.Status = "running"
	job.Progress = 10
	h.DB.Save(job)

	// Simulate progress updates
	for i := 20; i <= 90; i += 10 {
		time.Sleep(2 * time.Second)
		job.Progress = i
		h.DB.Save(job)
	}

	// Run actual backtest
	results, err := h.PBRunner.RunBacktest(params)
	if err != nil {
		job.Status = "failed"
		job.Error = err.Error()
		h.DB.Save(job)
		return
	}

	// Save results
	resultsBytes, _ := json.Marshal(results)
	job.Results = string(resultsBytes)
	job.Status = "completed"
	job.Progress = 100
	now := time.Now()
	job.CompletedAt = &now
	h.DB.Save(job)
}

// Optimization Handlers

func (h *Handlers) RunOptimization(c *gin.Context) {
	var params models.OptimizeParams
	if err := c.ShouldBindJSON(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Create job
	job := models.Job{
		ID:        uuid.New().String(),
		Type:      "optimize",
		Status:    "queued",
		Progress:  0,
		CreatedAt: time.Now(),
	}

	// Convert params to JSON
	paramsBytes, _ := json.Marshal(params)
	job.Params = string(paramsBytes)

	// Save job to database
	if err := h.DB.Create(&job).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Start optimization in goroutine
	go h.processOptimization(&job, params)

	c.JSON(http.StatusAccepted, gin.H{
		"job_id": job.ID,
		"status": "queued",
	})
}

func (h *Handlers) GetOptimizeJobs(c *gin.Context) {
	var jobs []models.Job
	if err := h.DB.Where("type = ?", "optimize").Find(&jobs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, jobs)
}

func (h *Handlers) GetOptimizeJob(c *gin.Context) {
	id := c.Param("id")
	var job models.Job
	
	if err := h.DB.First(&job, "id = ? AND type = ?", id, "optimize").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}
	
	c.JSON(http.StatusOK, job)
}

func (h *Handlers) GetOptimizeResults(c *gin.Context) {
	id := c.Param("id")
	var job models.Job
	
	if err := h.DB.First(&job, "id = ? AND type = ?", id, "optimize").Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Job not found"})
		return
	}

	if job.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Job not completed yet"})
		return
	}

	var results map[string]interface{}
	if err := json.Unmarshal([]byte(job.Results), &results); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to parse results"})
		return
	}

	c.JSON(http.StatusOK, results)
}

func (h *Handlers) processOptimization(job *models.Job, params models.OptimizeParams) {
	// Update job status to running
	job.Status = "running"
	job.Progress = 5
	h.DB.Save(job)

	// Simulate longer optimization process
	totalIterations := params.Iterations
	if totalIterations == 0 {
		totalIterations = 100
	}

	for i := 1; i <= totalIterations; i++ {
		time.Sleep(200 * time.Millisecond) // Simulate work
		progress := int(float64(i) / float64(totalIterations) * 95)
		job.Progress = progress + 5
		h.DB.Save(job)
	}

	// Mock optimization results
	results := map[string]interface{}{
		"best_parameters": map[string]interface{}{
			"grid_span":     0.15,
			"wallet_exposure_limit": 0.12,
			"max_n_entry_orders": 8,
		},
		"best_score":      1.85,
		"total_iterations": totalIterations,
		"completed_at":    time.Now(),
	}

	// Save results
	resultsBytes, _ := json.Marshal(results)
	job.Results = string(resultsBytes)
	job.Status = "completed"
	job.Progress = 100
	now := time.Now()
	job.CompletedAt = &now
	h.DB.Save(job)
}
