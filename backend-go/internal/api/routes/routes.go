package routes

import (
	"github.com/gin-gonic/gin"
	"pbgui-backend/internal/api/handlers"
	"pbgui-backend/internal/websocket"
)

func SetupRoutes(r *gin.Engine, h *handlers.Handlers) {
	api := r.Group("/api/v1")
	
	// Instance management
	instances := api.Group("/instances")
	{
		instances.GET("", h.GetInstances)
		instances.POST("", h.CreateInstance)
		instances.GET("/:id", h.GetInstance)
		instances.PUT("/:id", h.UpdateInstance)
		instances.DELETE("/:id", h.DeleteInstance)
		instances.POST("/:id/start", h.StartInstance)
		instances.POST("/:id/stop", h.StopInstance)
		instances.GET("/:id/logs", h.StreamLogs) // SSE endpoint
	}
	
	// Dashboard
	dashboard := api.Group("/dashboard")
	{
		dashboard.GET("/stats", h.GetDashboardStats)
		dashboard.GET("/performance", h.GetPerformance)
	}
	
	// Backtesting
	backtest := api.Group("/backtest")
	{
		backtest.POST("/run", h.RunBacktest)
		backtest.GET("/jobs", h.GetBacktestJobs)
		backtest.GET("/jobs/:id", h.GetBacktestJob)
		backtest.DELETE("/jobs/:id", h.CancelBacktestJob)
		backtest.GET("/results/:id", h.GetBacktestResults)
	}
	
	// Optimization
	optimize := api.Group("/optimize")
	{
		optimize.POST("/run", h.RunOptimization)
		optimize.GET("/jobs", h.GetOptimizeJobs)
		optimize.GET("/jobs/:id", h.GetOptimizeJob)
		optimize.GET("/results/:id", h.GetOptimizeResults)
	}
	
	// VPS Management
	vps := api.Group("/vps")
	{
		vps.GET("/servers", h.GetVPSServers)
		vps.POST("/servers", h.CreateVPSServer)
		vps.PUT("/servers/:id", h.UpdateVPSServer)
		vps.DELETE("/servers/:id", h.DeleteVPSServer)
		vps.POST("/servers/:id/deploy", h.DeployToVPS)
		vps.GET("/servers/:id/status", h.GetVPSStatus)
	}
	
	// Remote sync
	remote := api.Group("/remote")
	{
		remote.POST("/sync", h.TriggerSync)
		remote.GET("/status", h.GetSyncStatus)
		remote.PUT("/config", h.UpdateSyncConfig)
	}
	
	// Settings
	settings := api.Group("/settings")
	{
		settings.GET("", h.GetSettings)
		settings.PUT("", h.UpdateSettings)
		settings.GET("/paths", h.GetPaths)
		settings.PUT("/paths", h.UpdatePaths)
	}
	
	// WebSocket endpoints
	ws := r.Group("/ws")
	{
		ws.GET("/instances/:id/logs", websocket.HandleLogStream(h))
		ws.GET("/jobs/:id/progress", websocket.HandleJobProgress(h))
		ws.GET("/dashboard/metrics", websocket.HandleDashboardMetrics(h))
	}
	
	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
