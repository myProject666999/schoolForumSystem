package routes

import (
	"school-forum/controllers"
	"school-forum/middlewares"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	api := app.Group("/api")

	auth := api.Group("/auth")
	{
		auth.Post("/register", controllers.Register)
		auth.Post("/login", controllers.Login)
		auth.Post("/logout", middlewares.AuthRequired(), controllers.Logout)
		auth.Get("/me", middlewares.AuthRequired(), controllers.GetCurrentUser)
		auth.Put("/password", middlewares.AuthRequired(), controllers.ChangePassword)
	}

	users := api.Group("/users")
	{
		users.Get("/", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.GetUsers)
		users.Get("/:id", middlewares.AuthRequired(), controllers.GetUserByID)
		users.Put("/:id", middlewares.AuthRequired(), controllers.UpdateUser)
		users.Delete("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.DeleteUser)
		users.Get("/:id/topics", controllers.GetUserTopics)
		users.Get("/:id/replies", controllers.GetUserReplies)
	}

	boardCategories := api.Group("/board-categories")
	{
		boardCategories.Get("/", controllers.GetBoardCategories)
		boardCategories.Post("/", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.CreateBoardCategory)
		boardCategories.Put("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.UpdateBoardCategory)
		boardCategories.Delete("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.DeleteBoardCategory)
	}

	boards := api.Group("/boards")
	{
		boards.Get("/", controllers.GetBoards)
		boards.Get("/:id", controllers.GetBoardByID)
		boards.Post("/", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.CreateBoard)
		boards.Put("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.UpdateBoard)
		boards.Delete("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.DeleteBoard)
	}

	topicTypes := api.Group("/topic-types")
	{
		topicTypes.Get("/", controllers.GetTopicTypes)
		topicTypes.Post("/", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.CreateTopicType)
		topicTypes.Put("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.UpdateTopicType)
		topicTypes.Delete("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.DeleteTopicType)
	}

	topics := api.Group("/topics")
	{
		topics.Get("/", controllers.GetTopics)
		topics.Get("/hot", controllers.GetHotTopics)
		topics.Get("/latest", controllers.GetLatestTopics)
		topics.Get("/search", controllers.SearchTopics)
		topics.Get("/:id", controllers.GetTopicByID)
		topics.Post("/", middlewares.AuthRequired(), controllers.CreateTopic)
		topics.Put("/:id", middlewares.AuthRequired(), controllers.UpdateTopic)
		topics.Delete("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.DeleteTopic)
	}

	replies := api.Group("/replies")
	{
		replies.Get("/", controllers.GetReplies)
		replies.Get("/:id", controllers.GetReplyByID)
		replies.Post("/", middlewares.AuthRequired(), controllers.CreateReply)
		replies.Delete("/:id", middlewares.AuthRequired(), controllers.DeleteReply)
	}

	announcements := api.Group("/announcements")
	{
		announcements.Get("/", controllers.GetAnnouncements)
		announcements.Get("/:id", controllers.GetAnnouncementByID)
		announcements.Post("/", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.CreateAnnouncement)
		announcements.Put("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.UpdateAnnouncement)
		announcements.Delete("/:id", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.DeleteAnnouncement)
	}

	colleges := api.Group("/colleges")
	{
		colleges.Get("/", controllers.GetColleges)
	}

	associations := api.Group("/associations")
	{
		associations.Get("/", controllers.GetAssociations)
	}

	database := api.Group("/database")
	{
		database.Get("/tables", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.GetDatabaseTables)
		database.Get("/structure", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.GetTableStructure)
		database.Get("/records", middlewares.AuthRequired(), middlewares.AdminRequired(), controllers.GetTableRecords)
	}
}
