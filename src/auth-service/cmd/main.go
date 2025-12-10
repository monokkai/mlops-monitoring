package main

import (
	cmd "auth-service/internal/config"
	"auth-service/internal/handler"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	cfg := cmd.Load()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(gin.Logger())
	r.Use(gin.Recovery())

	r.GET("/ping", handler.Pong)

	port := ":" + cfg.Server.Port
	log.Printf("Starting server on %s", port)

	if err := r.Run(port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
