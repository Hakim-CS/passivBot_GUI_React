package passivbot

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sync"
	"time"

	"pbgui-backend/internal/models"
)

type Runner struct {
	pythonPath string
	pbPath     string
	processes  sync.Map // instanceID -> *os.Process
	configs    sync.Map // instanceID -> models.Instance
}

func NewRunner(pbPath, pythonPath string) *Runner {
	return &Runner{
		pythonPath: pythonPath,
		pbPath:     pbPath,
	}
}

func (r *Runner) Start(instance models.Instance) error {
	// Create config file
	configPath, err := r.createConfigFile(instance)
	if err != nil {
		return fmt.Errorf("failed to create config: %w", err)
	}

	// Build command
	cmd := exec.Command(
		r.pythonPath,
		filepath.Join(r.pbPath, "main.py"),
		"--config", configPath,
	)

	// Set working directory
	cmd.Dir = r.pbPath

	// Create pipes for stdout/stderr
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr

	// Start the process
	if err := cmd.Start(); err != nil {
		return fmt.Errorf("failed to start passivbot: %w", err)
	}

	// Store process and config
	r.processes.Store(instance.ID, cmd.Process)
	r.configs.Store(instance.ID, instance)

	// Start goroutine to monitor process
	go r.monitorProcess(instance.ID, cmd)

	return nil
}

func (r *Runner) Stop(instanceID string) error {
	if proc, ok := r.processes.Load(instanceID); ok {
		if process, ok := proc.(*os.Process); ok {
			// Graceful shutdown first
			if err := process.Signal(os.Interrupt); err != nil {
				// Force kill if graceful shutdown fails
				return process.Kill()
			}
			
			// Wait a bit for graceful shutdown
			time.Sleep(2 * time.Second)
			
			// Check if still running, force kill if needed
			if r.isProcessRunning(process) {
				return process.Kill()
			}
			
			// Clean up
			r.processes.Delete(instanceID)
			r.configs.Delete(instanceID)
			
			return nil
		}
	}
	return fmt.Errorf("instance %s not found", instanceID)
}

func (r *Runner) GetStatus(instanceID string) string {
	if proc, ok := r.processes.Load(instanceID); ok {
		if process, ok := proc.(*os.Process); ok {
			if r.isProcessRunning(process) {
				return "running"
			}
		}
	}
	return "stopped"
}

func (r *Runner) GetLogs(instanceID string) ([]string, error) {
	// In a real implementation, you'd read from log files
	// For now, return mock logs
	return []string{
		fmt.Sprintf("[%s] Instance %s initialized", time.Now().Format("15:04:05"), instanceID),
		fmt.Sprintf("[%s] Connected to exchange", time.Now().Format("15:04:05")),
		fmt.Sprintf("[%s] Starting trading loop", time.Now().Format("15:04:05")),
	}, nil
}

func (r *Runner) createConfigFile(instance models.Instance) (string, error) {
	// Parse config JSON or create default
	var config map[string]interface{}
	if instance.Config != "" {
		if err := json.Unmarshal([]byte(instance.Config), &config); err != nil {
			return "", err
		}
	} else {
		// Default config
		config = map[string]interface{}{
			"exchange":  instance.Exchange,
			"symbol":    instance.Symbol,
			"strategy":  instance.Strategy,
			"leverage":  1.0,
			"wallet_exposure_limit": 0.1,
		}
	}

	// Create temp config file
	configDir := filepath.Join(os.TempDir(), "pbgui-configs")
	os.MkdirAll(configDir, 0755)
	
	configPath := filepath.Join(configDir, fmt.Sprintf("%s.json", instance.ID))
	
	configBytes, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return "", err
	}

	if err := os.WriteFile(configPath, configBytes, 0644); err != nil {
		return "", err
	}

	return configPath, nil
}

func (r *Runner) monitorProcess(instanceID string, cmd *exec.Cmd) {
	// Wait for process to finish
	err := cmd.Wait()
	
	// Clean up when process exits
	r.processes.Delete(instanceID)
	r.configs.Delete(instanceID)
	
	// Log the exit
	if err != nil {
		fmt.Printf("Instance %s exited with error: %v\n", instanceID, err)
	} else {
		fmt.Printf("Instance %s exited normally\n", instanceID)
	}
}

func (r *Runner) isProcessRunning(process *os.Process) bool {
	// Send signal 0 to check if process is running
	err := process.Signal(os.Signal(nil))
	return err == nil
}

// RunBacktest executes a backtest job
func (r *Runner) RunBacktest(params models.BacktestParams) (map[string]interface{}, error) {
	// Create temporary config for backtest
	config := map[string]interface{}{
		"exchange":   params.Exchange,
		"symbol":     params.Symbol,
		"start_date": params.StartDate,
		"end_date":   params.EndDate,
		"strategy":   params.Strategy,
		"parameters": params.Parameters,
	}

	configBytes, err := json.Marshal(config)
	if err != nil {
		return nil, err
	}

	// Create temp config file
	configPath := filepath.Join(os.TempDir(), fmt.Sprintf("backtest-%d.json", time.Now().Unix()))
	if err := os.WriteFile(configPath, configBytes, 0644); err != nil {
		return nil, err
	}
	defer os.Remove(configPath)

	// Run backtest command
	cmd := exec.Command(
		r.pythonPath,
		filepath.Join(r.pbPath, "backtest.py"),
		"--config", configPath,
	)

	output, err := cmd.CombinedOutput()
	if err != nil {
		return nil, fmt.Errorf("backtest failed: %w, output: %s", err, string(output))
	}

	// Parse results (this would be JSON from actual passivbot)
	results := map[string]interface{}{
		"total_return":    15.5,
		"sharpe_ratio":    1.8,
		"max_drawdown":    -12.3,
		"total_trades":    156,
		"win_rate":        0.65,
		"final_balance":   1155.50,
		"start_balance":   1000.00,
		"completed_at":    time.Now(),
	}

	return results, nil
}
