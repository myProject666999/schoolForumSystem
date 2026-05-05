package controllers

import (
	"school-forum/database"
	"school-forum/models"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type BoardCategoryRequest struct {
	Name        string `json:"name" validate:"required"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order"`
}

type BoardRequest struct {
	Name          string `json:"name" validate:"required"`
	Description   string `json:"description"`
	Icon          string `json:"icon"`
	CategoryID    uint   `json:"category_id" validate:"required"`
	CollegeID     *uint  `json:"college_id"`
	AssociationID *uint  `json:"association_id"`
	SortOrder     int    `json:"sort_order"`
	Status        string `json:"status"`
}

func GetBoardCategories(c *fiber.Ctx) error {
	var categories []models.BoardCategory
	if result := database.DB.Order("sort_order ASC, created_at DESC").Find(&categories); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取板块分类失败",
		})
	}

	return c.JSON(categories)
}

func CreateBoardCategory(c *fiber.Ctx) error {
	var req BoardCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	category := models.BoardCategory{
		Name:        req.Name,
		Description: req.Description,
		SortOrder:   req.SortOrder,
	}

	if result := database.DB.Create(&category); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建板块分类失败",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message":  "创建成功",
		"category": category,
	})
}

func UpdateBoardCategory(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的分类ID",
		})
	}

	var category models.BoardCategory
	if result := database.DB.First(&category, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "分类不存在",
		})
	}

	var req BoardCategoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	if req.Name != "" {
		category.Name = req.Name
	}
	if req.Description != "" {
		category.Description = req.Description
	}
	if req.SortOrder != 0 {
		category.SortOrder = req.SortOrder
	}

	if result := database.DB.Save(&category); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新分类失败",
		})
	}

	return c.JSON(fiber.Map{
		"message":  "更新成功",
		"category": category,
	})
}

func DeleteBoardCategory(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的分类ID",
		})
	}

	var category models.BoardCategory
	if result := database.DB.First(&category, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "分类不存在",
		})
	}

	var boardCount int64
	database.DB.Model(&models.Board{}).Where("category_id = ?", id).Count(&boardCount)
	if boardCount > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "该分类下还有板块，请先删除板块",
		})
	}

	if result := database.DB.Delete(&category); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除分类失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "删除成功",
	})
}

func GetBoards(c *fiber.Ctx) error {
	categoryID := c.QueryInt("category_id", 0)
	status := c.Query("status", "active")

	var boards []models.Board
	query := database.DB.Model(&models.Board{})

	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if result := query.Preload("Category").Preload("College").Preload("Association").
		Order("sort_order ASC, created_at DESC").Find(&boards); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取板块列表失败",
		})
	}

	return c.JSON(boards)
}

func GetBoardByID(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的板块ID",
		})
	}

	var board models.Board
	if result := database.DB.Preload("Category").Preload("College").Preload("Association").
		First(&board, id); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "板块不存在",
			})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取板块信息失败",
		})
	}

	return c.JSON(board)
}

func CreateBoard(c *fiber.Ctx) error {
	var req BoardRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	board := models.Board{
		Name:          req.Name,
		Description:   req.Description,
		Icon:          req.Icon,
		CategoryID:    req.CategoryID,
		CollegeID:     req.CollegeID,
		AssociationID: req.AssociationID,
		SortOrder:     req.SortOrder,
		Status:        "active",
	}

	if result := database.DB.Create(&board); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "创建板块失败",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "创建成功",
		"board":   board,
	})
}

func UpdateBoard(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的板块ID",
		})
	}

	var board models.Board
	if result := database.DB.First(&board, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "板块不存在",
		})
	}

	var req BoardRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的请求数据",
		})
	}

	if req.Name != "" {
		board.Name = req.Name
	}
	if req.Description != "" {
		board.Description = req.Description
	}
	if req.Icon != "" {
		board.Icon = req.Icon
	}
	if req.CategoryID != 0 {
		board.CategoryID = req.CategoryID
	}
	if req.CollegeID != nil {
		board.CollegeID = req.CollegeID
	}
	if req.AssociationID != nil {
		board.AssociationID = req.AssociationID
	}
	if req.SortOrder != 0 {
		board.SortOrder = req.SortOrder
	}
	if req.Status != "" {
		board.Status = req.Status
	}

	if result := database.DB.Save(&board); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "更新板块失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "更新成功",
		"board":   board,
	})
}

func DeleteBoard(c *fiber.Ctx) error {
	id, err := c.ParamsInt("id")
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "无效的板块ID",
		})
	}

	var board models.Board
	if result := database.DB.First(&board, id); result.Error != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "板块不存在",
		})
	}

	var topicCount int64
	database.DB.Model(&models.Topic{}).Where("board_id = ?", id).Count(&topicCount)
	if topicCount > 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "该板块下还有帖子，请先处理帖子",
		})
	}

	if result := database.DB.Delete(&board); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "删除板块失败",
		})
	}

	return c.JSON(fiber.Map{
		"message": "删除成功",
	})
}

func GetColleges(c *fiber.Ctx) error {
	var colleges []models.College
	if result := database.DB.Order("created_at DESC").Find(&colleges); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取学院列表失败",
		})
	}
	return c.JSON(colleges)
}

func GetAssociations(c *fiber.Ctx) error {
	var associations []models.Association
	collegeID := c.QueryInt("college_id", 0)

	query := database.DB.Model(&models.Association{}).Preload("College")
	if collegeID > 0 {
		query = query.Where("college_id = ?", collegeID)
	}

	if result := query.Order("created_at DESC").Find(&associations); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取协会列表失败",
		})
	}
	return c.JSON(associations)
}
