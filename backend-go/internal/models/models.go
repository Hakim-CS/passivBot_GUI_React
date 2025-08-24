package models

import (
	"time"
)

// Instance represents a Passivbot trading instance
type Instance struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Exchange  string    `json:"exchange"`
	Symbol    string    `json:"symbol"`
	Strategy  string    `json:"strategy"`
	Status    string    `json:"status"` // running, stopped, error
	PNL       float64   `json:"pnl"`
	Position  float64   `json:"position"`
	Config    string    `json:"config" gorm:"type:text"` // JSON config
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// Job represents a background job (backtest, optimization)
type Job struct {
	ID          string     `json:"id" gorm:"primaryKey"`
	Type        string     `json:"type"`   // backtest, optimize
	Status      string     `json:"status"` // queued, running, completed, failed
	Progress    int        `json:"progress"`
	Results     string     `json:"results" gorm:"type:text"` // JSON results
	Error       string     `json:"error"`
	Params      string     `json:"params" gorm:"type:text"` // JSON params
	CreatedAt   time.Time  `json:"created_at"`
	CompletedAt *time.Time `json:"completed_at"`
}

// VPSServer represents a managed VPS server
type VPSServer struct {
	ID        string    `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name"`
	Host      string    `json:"host"`
	Port      int       `json:"port"`
	Username  string    `json:"username"`
	Status    string    `json:"status"` // online, offline, deploying
	CPU       float64   `json:"cpu"`
	Memory    float64   `json:"memory"`
	Disk      float64   `json:"disk"`
	Instances []string  `json:"instances" gorm:"type:text"` // JSON array
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// BacktestParams represents backtest configuration
type BacktestParams struct {
	Symbol     string                 `json:"symbol"`
	Exchange   string                 `json:"exchange"`
	StartDate  string                 `json:"start_date"`
	EndDate    string                 `json:"end_date"`
	Strategy   string                 `json:"strategy"`
	Parameters map[string]interface{} `json:"parameters"`
}

// OptimizeParams represents optimization configuration
type OptimizeParams struct {
	BacktestParams
	Method          string                `json:"method"` // grid, genetic, random
	ParameterRanges map[string][2]float64 `json:"parameter_ranges"`
	Iterations      int                   `json:"iterations"`
}

// DashboardStats represents dashboard statistics
type DashboardStats struct {
	TotalInstances   int     `json:"total_instances"`
	RunningInstances int     `json:"running_instances"`
	TotalPNL         float64 `json:"total_pnl"`
	DailyPNL         float64 `json:"daily_pnl"`
	ActiveJobs       int     `json:"active_jobs"`
	SystemUptime     string  `json:"system_uptime"`
}
