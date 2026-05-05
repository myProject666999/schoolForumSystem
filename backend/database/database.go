package database

import (
	"fmt"
	"school-forum/config"
	"school-forum/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDB() error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		config.AppConfig.DBUser,
		config.AppConfig.DBPassword,
		config.AppConfig.DBHost,
		config.AppConfig.DBPort,
		config.AppConfig.DBName,
	)

	var err error
	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
	})
	if err != nil {
		return err
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.College{},
		&models.Association{},
		&models.BoardCategory{},
		&models.Board{},
		&models.TopicType{},
		&models.Topic{},
		&models.Reply{},
		&models.Announcement{},
		&models.Like{},
	)
	if err != nil {
		return err
	}

	return nil
}
