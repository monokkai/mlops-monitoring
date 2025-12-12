package main

import (
	cmd "auth-service/internal/config"
	"auth-service/internal/handler"
	"log"
	"time"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := cmd.Load()
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":    "healthy",
			"service":   "auth",
			"timestamp": time.Now().Unix(),
		})
	})

	r.POST("/reqister", handler.Register)
	r.POST("/login", handler.Login)
	r.GET("/profile", handler.Profile)

	port := ":" + cfg.Server.Port
	log.Printf("Starting server on %s", port)

	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
