package controllers

import (
	"school-forum/database"
	"school-forum/middlewares"
	"school-forum/models"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type CreateAnnouncementRequest struct {
	Title   string `json:"title" validate:"required"`
	Content string `json:"content" validate:"required"`
	IsTop   bool   `json:"is_top"`
	Status  string `json:"status"`
}

type UpdateAnnouncementRequest struct {
	Title   string `json:"title"`
	Content string `json:"content"`
	IsTop   *bool  `json:"is_top"`
	Status  string `json:"status"`
}

func GetAnnouncements(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)
	status := c.Query("status", "published")

	var announcements []models.Announcement
	var total int64

	query := database.DB.Model(&models.Announcement{})

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if result := query.Preload("Author").
		Order("is_top DESC, publish_at DESC, created_at DESC").
		Offset(offset).Limit(pageSize).Find(&announcements); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取公告列表失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  announcements,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetAnnouncementByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的公告ID",
		})
	}

	var announcement models.Announcement
	if result := database.DB.Preload("Author").First(&announcement, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "公告不存在",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取公告信息失败",
		})
	}

	database.DB.Model(&announcement).Update("view_count", gorm.Expr("view_count + 1"))
	announcement.ViewCount++

	return c.JSON(announcement)
}

func CreateAnnouncement(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var req CreateAnnouncementRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	now := time.Now()
	announcement := models.Announcement{
		Title:     req.Title,
		Content:   req.Content,
		AuthorID:  userID,
		IsTop:     req.IsTop,
		ViewCount: 0,
		Status:    "draft",
	}

	if req.Status == "published" {
		announcement.Status = "published"
		announcement.PublishAt = &now
	}

	if result := database.DB.Create(&announcement); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建公告失败",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":      "创建成功",
		"announcement": announcement,
	})
}

func UpdateAnnouncement(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的公告ID",
		})
	}

	var announcement models.Announcement
	if result := database.DB.First(&announcement, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "公告不存在",
		})
	}

	var req UpdateAnnouncementRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	if req.Title != "" {
		announcement.Title = req.Title
	}
	if req.Content != "" {
		announcement.Content = req.Content
	}
	if req.IsTop != nil {
		announcement.IsTop = *req.IsTop
	}

	if req.Status != "" && req.Status != announcement.Status {
		announcement.Status = req.Status
		if req.Status == "published" && announcement.PublishAt == nil {
			now := time.Now()
			announcement.PublishAt = &now
		}
	}

	if result := database.DB.Save(&announcement); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新公告失败",
		})
	}

	return c.JSON(fiber.Map{
		"message":      "更新成功",
		"announcement": announcement,
	})
}

func DeleteAnnouncement(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的公告ID",
		})
	}

	var announcement models.Announcement
	if result := database.DB.First(&announcement, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "公告不存在",
		})
	}

	announcement.Status = "deleted"
	if result := database.DB.Save(&announcement); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除公告失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "公告已删除",
	})
}
