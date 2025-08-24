package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"

	"pbgui-backend/internal/api/handlers"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		// Allow connections from any origin (configure properly for production)
		return true
	},
}

// HandleLogStream handles WebSocket connections for log streaming
func HandleLogStream(h *handlers.Handlers) gin.HandlerFunc {
	return func(c *gin.Context) {
		instanceID := c.Param("id")
		
		// Upgrade HTTP connection to WebSocket
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}
		defer conn.Close()

		// Create channels for communication
		logChan := make(chan string, 100)
		done := make(chan bool)

		// Start log generation goroutine
		go func() {
			defer close(logChan)
			ticker := time.NewTicker(500 * time.Millisecond)
			defer ticker.Stop()

			logCount := 0
			for {
				select {
				case <-done:
					return
				case <-ticker.C:
					logCount++
					timestamp := time.Now().Format("15:04:05")
					
					logMessage := map[string]interface{}{
						"timestamp":   timestamp,
						"instance_id": instanceID,
						"level":       "INFO",
						"message":     generateLogMessage(logCount),
					}

					messageBytes, _ := json.Marshal(logMessage)
					select {
					case logChan <- string(messageBytes):
					case <-done:
						return
					}
				}
			}
		}()

		// Handle WebSocket communication
		for {
			select {
			case logMessage, ok := <-logChan:
				if !ok {
					return
				}
				
				// Send log message to client
				if err := conn.WriteMessage(websocket.TextMessage, []byte(logMessage)); err != nil {
					log.Printf("Failed to write message: %v", err)
					close(done)
					return
				}

			default:
				// Check for client disconnect
				conn.SetReadDeadline(time.Now().Add(time.Second))
				_, _, err := conn.ReadMessage()
				if err != nil {
					if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
						log.Printf("WebSocket error: %v", err)
					}
					close(done)
					return
				}
			}
		}
	}
}

// HandleJobProgress handles WebSocket connections for job progress updates
func HandleJobProgress(h *handlers.Handlers) gin.HandlerFunc {
	return func(c *gin.Context) {
		jobID := c.Param("id")
		
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}
		defer conn.Close()

		// Send periodic job progress updates
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				// Get job from database
				var job struct {
					ID       string `json:"id"`
					Status   string `json:"status"`
					Progress int    `json:"progress"`
				}
				
				// Mock job progress
				if err := h.DB.Raw("SELECT id, status, progress FROM jobs WHERE id = ?", jobID).Scan(&job).Error; err != nil {
					// Job not found, send error and close
					errorMsg := map[string]interface{}{
						"error": "Job not found",
						"job_id": jobID,
					}
					conn.WriteJSON(errorMsg)
					return
				}

				// Send progress update
				if err := conn.WriteJSON(job); err != nil {
					log.Printf("Failed to write JSON: %v", err)
					return
				}

				// If job is completed or failed, close connection
				if job.Status == "completed" || job.Status == "failed" || job.Status == "cancelled" {
					return
				}

			default:
				// Check for client disconnect
				conn.SetReadDeadline(time.Now().Add(time.Second))
				_, _, err := conn.ReadMessage()
				if err != nil {
					if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
						log.Printf("WebSocket error: %v", err)
					}
					return
				}
			}
		}
	}
}

// HandleDashboardMetrics handles WebSocket connections for live dashboard updates
func HandleDashboardMetrics(h *handlers.Handlers) gin.HandlerFunc {
	return func(c *gin.Context) {
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("Failed to upgrade connection: %v", err)
			return
		}
		defer conn.Close()

		ticker := time.NewTicker(5 * time.Second)
		defer ticker.Stop()

		for {
			select {
			case <-ticker.C:
				// Get live dashboard metrics
				metrics := map[string]interface{}{
					"timestamp":        time.Now(),
					"total_pnl":        1250.75 + float64(time.Now().Second())*0.1,
					"active_instances": 5,
					"running_jobs":     2,
					"cpu_usage":        45.2 + float64(time.Now().Second()%10),
					"memory_usage":     67.8 + float64(time.Now().Second()%5),
				}

				if err := conn.WriteJSON(metrics); err != nil {
					log.Printf("Failed to write JSON: %v", err)
					return
				}

			default:
				// Check for client disconnect
				conn.SetReadDeadline(time.Now().Add(time.Second))
				_, _, err := conn.ReadMessage()
				if err != nil {
					if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
						log.Printf("WebSocket error: %v", err)
					}
					return
				}
			}
		}
	}
}

func generateLogMessage(count int) string {
	messages := []string{
		"Market data received successfully",
		"Position check completed",
		"Order book updated",
		"Grid levels calculated",
		"Risk parameters validated",
		"Exchange connection stable",
		"PnL calculation updated",
		"Strategy signals processed",
	}
	
	return messages[count%len(messages)]
}
