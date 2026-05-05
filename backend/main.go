package main

import (
	"log"
	"school-forum/config"
	"school-forum/database"
	"school-forum/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
)

func main() {
	if err := config.LoadConfig(); err != nil {
		log.Fatal("加载配置失败:", err)
	}

	if err := database.ConnectDB(); err != nil {
		log.Fatal("连接数据库失败:", err)
	}

	app := fiber.New(fiber.Config{
		AppName: "School Forum System",
	})

	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: config.AppConfig.FrontendURL,
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	routes.SetupRoutes(app)

	app.Get("/", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"message": "学校论坛系统 API",
			"version": "1.0.0",
		})
	})

	log.Printf("服务器启动在端口 %s", config.AppConfig.ServerPort)
	if err := app.Listen(":" + config.AppConfig.ServerPort); err != nil {
		log.Fatal("启动服务器失败:", err)
	}
}
