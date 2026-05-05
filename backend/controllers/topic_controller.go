package controllers

import (
	"school-forum/database"
	"school-forum/middlewares"
	"school-forum/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type TopicTypeRequest struct {
	Name      string `json:"name" validate:"required"`
	Color     string `json:"color"`
	SortOrder int    `json:"sort_order"`
}

type CreateTopicRequest struct {
	Title   string `json:"title" validate:"required"`
	Content string `json:"content" validate:"required"`
	BoardID uint   `json:"board_id" validate:"required"`
	TypeID  *uint  `json:"type_id"`
}

type UpdateTopicRequest struct {
	Title     string `json:"title"`
	Content   string `json:"content"`
	BoardID   uint   `json:"board_id"`
	TypeID    *uint  `json:"type_id"`
	IsTop     *bool  `json:"is_top"`
	IsEssence *bool `json:"is_essence"`
	Status    string `json:"status"`
}

func GetTopicTypes(c *fiber.Ctx) error {
	var types []models.TopicType
	if result := database.DB.Order("sort_order ASC, created_at DESC").Find(&types); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取主题帖类型失败",
		})
	}
	return c.JSON(types)
}

func CreateTopicType(c *fiber.Ctx) error {
	var req TopicTypeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	topicType := models.TopicType{
		Name:      req.Name,
		Color:     req.Color,
		SortOrder: req.SortOrder,
	}
	if topicType.Color == "" {
		topicType.Color = "#1890ff"
	}

	if result := database.DB.Create(&topicType); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建主题帖类型失败",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "创建成功",
		"type":    topicType,
	})
}

func UpdateTopicType(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的类型ID",
		})
	}

	var topicType models.TopicType
	if result := database.DB.First(&topicType, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "类型不存在",
		})
	}

	var req TopicTypeRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	if req.Name != "" {
		topicType.Name = req.Name
	}
	if req.Color != "" {
		topicType.Color = req.Color
	}
	if req.SortOrder != 0 {
		topicType.SortOrder = req.SortOrder
	}

	if result := database.DB.Save(&topicType); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新类型失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "更新成功",
		"type":    topicType,
	})
}

func DeleteTopicType(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的类型ID",
		})
	}

	var topicType models.TopicType
	if result := database.DB.First(&topicType, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "类型不存在",
		})
	}

	if result := database.DB.Delete(&topicType); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除类型失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "删除成功",
	})
}

func GetTopics(c *fiber.Ctx) error {
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)
	boardID := c.QueryInt("board_id", 0)
	keyword := c.Query("keyword", "")
	status := c.Query("status", "normal")

	var topics []models.Topic
	var total int64

	query := database.DB.Model(&models.Topic{})

	if boardID > 0 {
		query = query.Where("board_id = ?", boardID)
	}
	if keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	if result := query.Preload("User").Preload("Board").Preload("Type").
		Order("is_top DESC, created_at DESC").Offset(offset).Limit(pageSize).Find(&topics); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取主题帖列表失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  topics,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}

func GetHotTopics(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)

	var topics []models.Topic
	if result := database.DB.Where("status = ?", "normal").
		Preload("User").Preload("Board").Preload("Type").
		Order("view_count DESC, reply_count DESC, like_count DESC").
		Limit(limit).Find(&topics); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取热门话题失败",
		})
	}

	return c.JSON(topics)
}

func GetLatestTopics(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 10)

	var topics []models.Topic
	if result := database.DB.Where("status = ?", "normal").
		Preload("User").Preload("Board").Preload("Type").
		Order("created_at DESC").
		Limit(limit).Find(&topics); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取最新帖子失败",
		})
	}

	return c.JSON(topics)
}

func GetTopicByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的主题帖ID",
		})
	}

	var topic models.Topic
	if result := database.DB.Preload("User").Preload("Board").Preload("Type").
		First(&topic, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "主题帖不存在",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取主题帖信息失败",
		})
	}

	database.DB.Model(&topic).Update("view_count", gorm.Expr("view_count + 1"))
	topic.ViewCount++

	return c.JSON(topic)
}

func CreateTopic(c *fiber.Ctx) error {
	userID := middlewares.GetUserID(c)

	var req CreateTopicRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	topic := models.Topic{
		Title:   req.Title,
		Content: req.Content,
		UserID:  userID,
		BoardID: req.BoardID,
		TypeID:  req.TypeID,
		Status:  "normal",
	}

	if result := database.DB.Create(&topic); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建主题帖失败",
		})
	}

	database.DB.Model(&models.Board{}).Where("id = ?", req.BoardID).
		Update("post_count", gorm.Expr("post_count + 1"))

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "发布成功",
		"topic":   topic,
	})
}

func UpdateTopic(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的主题帖ID",
		})
	}

	userID := middlewares.GetUserID(c)
	userRole := middlewares.GetUserRole(c)

	var topic models.Topic
	if result := database.DB.First(&topic, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "主题帖不存在",
		})
	}

	if userRole != "admin" && topic.UserID != userID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "无权限修改此主题帖",
		})
	}

	var req UpdateTopicRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	if req.Title != "" {
		topic.Title = req.Title
	}
	if req.Content != "" {
		topic.Content = req.Content
	}
	if req.BoardID != 0 {
		topic.BoardID = req.BoardID
	}
	if req.TypeID != nil {
		topic.TypeID = req.TypeID
	}
	if userRole == "admin" {
		if req.IsTop != nil {
			topic.IsTop = *req.IsTop
		}
		if req.IsEssence != nil {
			topic.IsEssence = *req.IsEssence
		}
		if req.Status != "" {
			topic.Status = req.Status
		}
	}

	if result := database.DB.Save(&topic); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新主题帖失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "更新成功",
		"topic":   topic,
	})
}

func DeleteTopic(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的主题帖ID",
		})
	}

	var topic models.Topic
	if result := database.DB.First(&topic, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "主题帖不存在",
		})
	}

	topic.Status = "deleted"
	if result := database.DB.Save(&topic); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除主题帖失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "主题帖已删除",
	})
}

func SearchTopics(c *fiber.Ctx) error {
	keyword := c.Query("keyword", "")
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 10)

	if keyword == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "请输入搜索关键词",
		})
	}

	var topics []models.Topic
	var total int64

	query := database.DB.Model(&models.Topic{}).
		Where("status = ? AND (title LIKE ? OR content LIKE ?)", "normal", "%"+keyword+"%", "%"+keyword+"%")

	query.Count(&total)

	offset := (page - 1) * pageSize
	if result := query.Preload("User").Preload("Board").Preload("Type").
		Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&topics); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "搜索失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  topics,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}
