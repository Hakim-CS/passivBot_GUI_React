package handlers

import (
	"bufio"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

// StreamLogs handles Server-Sent Events for log streaming
func (h *Handlers) StreamLogs(c *gin.Context) {
	instanceID := c.Param("id")
	
	// Set headers for SSE
	c.Header("Content-Type", "text/event-stream")
	c.Header("Cache-Control", "no-cache")
	c.Header("Connection", "keep-alive")
	c.Header("Access-Control-Allow-Origin", "*")

	// Create a channel for logs
	logChan := make(chan string, 100)
	done := make(chan bool)

	// Start log streaming in goroutine
	go func() {
		defer close(logChan)
		ticker := time.NewTicker(1 * time.Second)
		defer ticker.Stop()

		logCount := 0
		for {
			select {
			case <-done:
				return
			case <-ticker.C:
				logCount++
				timestamp := time.Now().Format("15:04:05")
				
				// Simulate different types of logs
				var logMessage string
				switch logCount % 4 {
				case 0:
					logMessage = fmt.Sprintf("[%s] Instance %s: Market data received", timestamp, instanceID)
				case 1:
					logMessage = fmt.Sprintf("[%s] Instance %s: Position check completed", timestamp, instanceID)
				case 2:
					logMessage = fmt.Sprintf("[%s] Instance %s: Order book updated", timestamp, instanceID)
				case 3:
					logMessage = fmt.Sprintf("[%s] Instance %s: PnL: +$%.2f", timestamp, instanceID, float64(logCount)*0.15)
				}

				select {
				case logChan <- logMessage:
				case <-done:
					return
				}
			}
		}
	}()

	// Stream logs to client
	c.Stream(func(w gin.ResponseWriter) bool {
		select {
		case logMessage, ok := <-logChan:
			if !ok {
				return false
			}
			
			// Send SSE formatted message
			fmt.Fprintf(w, "data: %s\n\n", logMessage)
			return true
			
		case <-c.Request.Context().Done():
			close(done)
			return false
		}
	})
}
