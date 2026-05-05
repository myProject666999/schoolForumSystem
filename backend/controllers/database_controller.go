package controllers

import (
	"school-forum/config"
	"school-forum/database"

	"github.com/gofiber/fiber/v2"
)

func GetDatabaseTables(c *fiber.Ctx) error {
	var tables []map[string]interface{}

	query := `
		SELECT 
			TABLE_NAME as table_name,
			TABLE_COMMENT as table_comment,
			TABLE_ROWS as table_rows,
			DATA_LENGTH as data_length,
			CREATE_TIME as create_time,
			UPDATE_TIME as update_time
		FROM information_schema.TABLES 
		WHERE TABLE_SCHEMA = ?
		ORDER BY TABLE_NAME
	`

	if result := database.DB.Raw(query, config.AppConfig.DBName).Scan(&tables); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取数据库表列表失败",
		})
	}

	return c.JSON(tables)
}

func GetTableStructure(c *fiber.Ctx) error {
	tableName := c.Query("table_name", "")
	if tableName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "缺少表名参数",
		})
	}

	var columns []map[string]interface{}

	query := `
		SELECT 
			COLUMN_NAME as column_name,
			COLUMN_TYPE as column_type,
			IS_NULLABLE as is_nullable,
			COLUMN_KEY as column_key,
			COLUMN_DEFAULT as column_default,
			EXTRA as extra,
			COLUMN_COMMENT as column_comment
		FROM information_schema.COLUMNS 
		WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
		ORDER BY ORDINAL_POSITION
	`

	if result := database.DB.Raw(query, config.AppConfig.DBName, tableName).Scan(&columns); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取表结构失败",
		})
	}

	return c.JSON(columns)
}

func GetTableRecords(c *fiber.Ctx) error {
	tableName := c.Query("table_name", "")
	page := c.QueryInt("page", 1)
	pageSize := c.QueryInt("page_size", 20)

	if tableName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "缺少表名参数",
		})
	}

	allowedTables := []string{
		"users", "colleges", "associations", "board_categories", "boards",
		"topic_types", "topics", "replies", "announcements", "likes",
	}

	isAllowed := false
	for _, t := range allowedTables {
		if t == tableName {
			isAllowed = true
			break
		}
	}

	if !isAllowed {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "不允许访问此表",
		})
	}

	var total int64
	countQuery := "SELECT COUNT(*) as count FROM " + tableName
	if result := database.DB.Raw(countQuery).Scan(&total); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取记录总数失败",
		})
	}

	offset := (page - 1) * pageSize
	var records []map[string]interface{}
	query := "SELECT * FROM " + tableName + " ORDER BY id DESC LIMIT ? OFFSET ?"

	if result := database.DB.Raw(query, pageSize, offset).Scan(&records); result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "获取表记录失败",
		})
	}

	return c.JSON(fiber.Map{
		"data":  records,
		"total": total,
		"page":  page,
		"page_size": pageSize,
	})
}
