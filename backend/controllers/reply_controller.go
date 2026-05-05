package controllers

import (
	"school-forum/database"
	"school-forum/middlewares"
	"school-forum/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CreateReplyRequest struct {
	Content  string `json:"content" validate:"required"`
	TopicID  uint   `json:"topic_id" validate:"required"`
	ParentID *uint  `json:"parent_id"`
}

func GetReplies(c *fiber.Ctx) error {
	topicID := c.QueryInt("topic_id", 0)
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)

	if topicID == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "缺少主题帖ID",
		})
	}

	var replies []models.Reply
	var total int64

	query := database.DB.Model(&models.Reply{}).
		Where("topic_id = ? AND status = ? AND parent_id IS NULL", topicID, "normal")

	query.Count(&total)

	offset := (page - 1) * pageSize
	if result := query.Preload("User").
		Order("created_at ASC").Offset(offset).Limit(pageSize).Find(&replies); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取回复列表失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  replies,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetReplyByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的回复ID",
		})
	}

	var reply models.Reply
	if result := database.DB.Preload("User").Preload("Topic").Preload("Parent.User").
		First(&reply, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "回复不存在",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取回复信息失败",
		})
	}

	return c.JSON(reply)
}

func CreateReply(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var req CreateReplyRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	var topic models.Topic
	if result := database.DB.First(&topic, req.TopicID); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "主题帖不存在",
		})
	}

	if topic.Status != "normal" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "该主题帖已关闭",
		})
	}

	reply := models.Reply{
		Content:  req.Content,
		UserID:   userID,
		TopicID:  req.TopicID,
		ParentID: req.ParentID,
		Status:   "normal",
	}

	if result := database.DB.Create(&reply); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建回复失败",
		})
	}

	database.DB.Model(&topic).Update("reply_count", gorm.Expr("reply_count + 1"))

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "回复成功",
		"reply":   reply,
	})
}

func DeleteReply(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的回复ID",
		})
	}

	userID := middlewares.GetUserID(c)
	userRole := middlewares.GetUserRole(c)

	var reply models.Reply
	if result := database.DB.First(&reply, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "回复不存在",
		})
	}

	if userRole != "admin" && reply.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "无权限删除此回复",
		})
	}

	reply.Status = "deleted"
	if result := database.DB.Save(&reply); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除回复失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "回复已删除",
	})
}
