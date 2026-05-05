-- 创建数据库
CREATE DATABASE IF NOT EXISTS school_forum DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE school_forum;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    nickname VARCHAR(50),
    avatar VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    status ENUM('active', 'banned', 'deleted') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 学院组织表
CREATE TABLE IF NOT EXISTS colleges (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 协会表
CREATE TABLE IF NOT EXISTS associations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    college_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 板块分类表
CREATE TABLE IF NOT EXISTS board_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 板块表
CREATE TABLE IF NOT EXISTS boards (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(255),
    category_id INT NOT NULL,
    college_id INT,
    association_id INT,
    post_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    sort_order INT DEFAULT 0,
    status ENUM('active', 'hidden') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES board_categories(id) ON DELETE CASCADE,
    FOREIGN KEY (college_id) REFERENCES colleges(id) ON DELETE SET NULL,
    FOREIGN KEY (association_id) REFERENCES associations(id) ON DELETE SET NULL,
    INDEX idx_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 主题帖类型表
CREATE TABLE IF NOT EXISTS topic_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    color VARCHAR(20) DEFAULT '#1890ff',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 主题帖表
CREATE TABLE IF NOT EXISTS topics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    board_id INT NOT NULL,
    type_id INT,
    is_top BOOLEAN DEFAULT FALSE,
    is_essence BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    reply_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    status ENUM('normal', 'hidden', 'deleted') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    FOREIGN KEY (type_id) REFERENCES topic_types(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_board (board_id),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 回复表
CREATE TABLE IF NOT EXISTS replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    topic_id INT NOT NULL,
    parent_id INT DEFAULT NULL,
    like_count INT DEFAULT 0,
    status ENUM('normal', 'hidden', 'deleted') DEFAULT 'normal',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES replies(id) ON DELETE CASCADE,
    INDEX idx_topic (topic_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 公告表
CREATE TABLE IF NOT EXISTS announcements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    author_id INT NOT NULL,
    is_top BOOLEAN DEFAULT FALSE,
    view_count INT DEFAULT 0,
    status ENUM('draft', 'published', 'deleted') DEFAULT 'draft',
    publish_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_publish_at (publish_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 点赞表
CREATE TABLE IF NOT EXISTS likes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target_type ENUM('topic', 'reply') NOT NULL,
    target_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY uk_user_target (user_id, target_type, target_id),
    INDEX idx_target (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 插入默认管理员账户 (密码: admin123)
INSERT INTO users (username, password, email, nickname, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeWjQP279pGY9e0RrFp0ZpGf0e0WnqWu', 'admin@school.edu', '管理员', 'admin', 'active');

-- 插入默认板块分类
INSERT INTO board_categories (name, description, sort_order) VALUES
('校园生活', '分享校园生活点滴', 1),
('学习交流', '学习资料分享与讨论', 2),
('社团活动', '社团相关活动与讨论', 3),
('兴趣爱好', '各类兴趣爱好交流', 4);

-- 插入默认主题帖类型
INSERT INTO topic_types (name, color, sort_order) VALUES
('讨论', '#1890ff', 1),
('求助', '#faad14', 2),
('分享', '#52c41a', 3),
('公告', '#f5222d', 4);

-- 插入默认学院
INSERT INTO colleges (name, description) VALUES
('计算机学院', '计算机科学与技术学院'),
('经济管理学院', '经济与管理学院'),
('外国语学院', '外国语学院');

-- 插入默认协会
INSERT INTO associations (name, description, college_id) VALUES
('计算机协会', '计算机技术爱好者协会', 1),
('创业协会', '创新创业实践协会', 2),
('英语角', '英语学习交流协会', 3);

-- 插入默认板块
INSERT INTO boards (name, description, category_id, sort_order) VALUES
('新生报到', '新生交流与报到咨询', 1, 1),
('校园新闻', '校园最新动态', 1, 2),
('课程资料', '课程资料分享', 2, 1),
('考研交流', '考研经验与资料分享', 2, 2),
('社团招新', '社团招新信息发布', 3, 1),
('活动预告', '社团活动预告', 3, 2),
('技术交流', '技术问题讨论与分享', 4, 1),
('游戏天地', '游戏爱好者交流', 4, 2);
