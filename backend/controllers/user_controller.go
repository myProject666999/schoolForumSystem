package controllers

import (
	"school-forum/database"
	"school-forum/middlewares"
	"school-forum/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type UpdateUserRequest struct {
	Nickname string `json:"nickname"`
	Email    string `json:"email"`
	Avatar   string `json:"avatar"`
	Status   string `json:"status"`
}

func GetUsers(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)
	keyword := c.Query("keyword", "")
	status := c.Query("status", "")

	var users []models.User
	var total int64

	query := database.DB.Model(&models.User{})

	if keyword != "" {
		query = query.Where("username LIKE ? OR nickname LIKE ? OR email LIKE ?",
			"%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%")
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if result := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&users); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取用户列表失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  users,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetUserByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的用户ID",
		})
	}

	var user models.User
	if result := database.DB.First(&user, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "用户不存在",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取用户信息失败",
		})
	}

	return c.JSON(user)
}

func UpdateUser(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的用户ID",
		})
	}

	currentUserID := middlewares.GetUserID(c)
	userRole := middlewares.GetUserRole(c)

	if userRole != "admin" && uint(id) != currentUserID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "无权限修改此用户",
		})
	}

	var user models.User
	if result := database.DB.First(&user, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "用户不存在",
		})
	}

	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	if req.Nickname != "" {
		user.Nickname = req.Nickname
	}
	if req.Email != "" {
		user.Email = req.Email
	}
	if req.Avatar != "" {
		user.Avatar = req.Avatar
	}

	if userRole == "admin" && req.Status != "" {
		user.Status = req.Status
	}

	if result := database.DB.Save(&user); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新用户失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "更新成功",
		"user":    user,
	})
}

func DeleteUser(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的用户ID",
		})
	}

	var user models.User
	if result := database.DB.First(&user, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "用户不存在",
		})
	}

	user.Status = "deleted"
	if result := database.DB.Save(&user); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除用户失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "用户已删除",
	})
}

func GetUserTopics(c *fiber.Ctx) error {
	userID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的用户ID",
		})
	}

	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)

	var topics []models.Topic
	var total int64

	query := database.DB.Model(&models.Topic{}).Where("user_id = ? AND status = ?", userID, "normal")

	query.Count(&total)

	offset := (page - 1) * pageSize
	if result := query.Preload("User").Preload("Board").Preload("Type").
		Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&topics); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取用户主题帖失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  topics,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetUserReplies(c *fiber.Ctx) error {
	userID, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的用户ID",
		})
	}

	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)

	var replies []models.Reply
	var total int64

	query := database.DB.Model(&models.Reply{}).Where("user_id = ? AND status = ?", userID, "normal")

	query.Count(&total)

	offset := (page - 1) * pageSize
	if result := query.Preload("User").Preload("Topic").
		Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&replies); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取用户回复失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  replies,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}
