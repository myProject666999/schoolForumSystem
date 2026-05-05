package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Username  string         `json:"username" gorm:"uniqueIndex;size:50;not null"`
	Password  string         `json:"-" gorm:"size:255;not null"`
	Email     string         `json:"email" gorm:"uniqueIndex;size:100;not null"`
	Nickname  string         `json:"nickname" gorm:"size:50"`
	Avatar    string         `json:"avatar" gorm:"size:255"`
	Role      string         `json:"role" gorm:"size:20;default:user"`
	Status    string         `json:"status" gorm:"size:20;default:active"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type College struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Description string         `json:"description" gorm:"type:text"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Association struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Description string         `json:"description" gorm:"type:text"`
	CollegeID   *uint          `json:"college_id"`
	College     *College       `json:"college,omitempty" gorm:"foreignKey:CollegeID"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type BoardCategory struct {
	ID          uint           `json:"id" gorm:"primaryKey"`
	Name        string         `json:"name" gorm:"size:100;not null"`
	Description string         `json:"description" gorm:"type:text"`
	SortOrder   int            `json:"sort_order" gorm:"default:0"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `json:"-" gorm:"index"`
}

type Board struct {
	ID            uint           `json:"id" gorm:"primaryKey"`
	Name          string         `json:"name" gorm:"size:100;not null"`
	Description   string         `json:"description" gorm:"type:text"`
	Icon          string         `json:"icon" gorm:"size:255"`
	CategoryID    uint           `json:"category_id"`
	Category      *BoardCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	CollegeID     *uint          `json:"college_id"`
	College       *College       `json:"college,omitempty" gorm:"foreignKey:CollegeID"`
	AssociationID *uint          `json:"association_id"`
	Association   *Association   `json:"association,omitempty" gorm:"foreignKey:AssociationID"`
	PostCount     int            `json:"post_count" gorm:"default:0"`
	ViewCount     int            `json:"view_count" gorm:"default:0"`
	SortOrder     int            `json:"sort_order" gorm:"default:0"`
	Status        string         `json:"status" gorm:"size:20;default:active"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `json:"-" gorm:"index"`
}

type TopicType struct {
	ID        uint           `json:"id" gorm:"primaryKey"`
	Name      string         `json:"name" gorm:"size:50;not null"`
	Color     string         `json:"color" gorm:"size:20;default:#1890ff"`
	SortOrder int            `json:"sort_order" gorm:"default:0"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

type Topic struct {
	ID         uint         `json:"id" gorm:"primaryKey"`
	Title      string       `json:"title" gorm:"size:200;not null"`
	Content    string       `json:"content" gorm:"type:text;not null"`
	UserID     uint         `json:"user_id"`
	User       *User        `json:"user,omitempty" gorm:"foreignKey:UserID"`
	BoardID    uint         `json:"board_id"`
	Board      *Board       `json:"board,omitempty" gorm:"foreignKey:BoardID"`
	TypeID     *uint        `json:"type_id"`
	Type       *TopicType   `json:"type,omitempty" gorm:"foreignKey:TypeID"`
	IsTop      bool         `json:"is_top" gorm:"default:false"`
	IsEssence  bool         `json:"is_essence" gorm:"default:false"`
	ViewCount  int          `json:"view_count" gorm:"default:0"`
	ReplyCount int          `json:"reply_count" gorm:"default:0"`
	LikeCount  int          `json:"like_count" gorm:"default:0"`
	Status     string       `json:"status" gorm:"size:20;default:normal"`
	CreatedAt  time.Time    `json:"created_at"`
	UpdatedAt  time.Time    `json:"updated_at"`
}

type Reply struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	UserID    uint      `json:"user_id"`
	User      *User     `json:"user,omitempty" gorm:"foreignKey:UserID"`
	TopicID   uint      `json:"topic_id"`
	Topic     *Topic    `json:"topic,omitempty" gorm:"foreignKey:TopicID"`
	ParentID  *uint     `json:"parent_id"`
	Parent    *Reply    `json:"parent,omitempty" gorm:"foreignKey:ParentID"`
	LikeCount int       `json:"like_count" gorm:"default:0"`
	Status    string    `json:"status" gorm:"size:20;default:normal"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Announcement struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Title     string    `json:"title" gorm:"size:200;not null"`
	Content   string    `json:"content" gorm:"type:text;not null"`
	AuthorID  uint      `json:"author_id"`
	Author    *User     `json:"author,omitempty" gorm:"foreignKey:AuthorID"`
	IsTop     bool      `json:"is_top" gorm:"default:false"`
	ViewCount int       `json:"view_count" gorm:"default:0"`
	Status    string    `json:"status" gorm:"size:20;default:draft"`
	PublishAt *time.Time `json:"publish_at"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Like struct {
	ID         uint      `json:"id" gorm:"primaryKey"`
	UserID     uint      `json:"user_id"`
	TargetType string    `json:"target_type" gorm:"size:20;not null"`
	TargetID   uint      `json:"target_id"`
	CreatedAt  time.Time `json:"created_at"`
}
