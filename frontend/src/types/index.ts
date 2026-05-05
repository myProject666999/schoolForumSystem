export interface User {
  id: number
  username: string
  email: string
  nickname: string
  avatar: string
  role: 'user' | 'admin'
  status: 'active' | 'banned' | 'deleted'
  created_at: string
  updated_at: string
}

export interface College {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface Association {
  id: number
  name: string
  description: string
  college_id: number | null
  college?: College
  created_at: string
  updated_at: string
}

export interface BoardCategory {
  id: number
  name: string
  description: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Board {
  id: number
  name: string
  description: string
  icon: string
  category_id: number
  category?: BoardCategory
  college_id: number | null
  college?: College
  association_id: number | null
  association?: Association
  post_count: number
  view_count: number
  sort_order: number
  status: 'active' | 'hidden'
  created_at: string
  updated_at: string
}

export interface TopicType {
  id: number
  name: string
  color: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Topic {
  id: number
  title: string
  content: string
  user_id: number
  user?: User
  board_id: number
  board?: Board
  type_id: number | null
  type?: TopicType
  is_top: boolean
  is_essence: boolean
  view_count: number
  reply_count: number
  like_count: number
  status: 'normal' | 'hidden' | 'deleted'
  created_at: string
  updated_at: string
}

export interface Reply {
  id: number
  content: string
  user_id: number
  user?: User
  topic_id: number
  topic?: Topic
  parent_id: number | null
  parent?: Reply
  like_count: number
  status: 'normal' | 'hidden' | 'deleted'
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: number
  title: string
  content: string
  author_id: number
  author?: User
  is_top: boolean
  view_count: number
  status: 'draft' | 'published' | 'deleted'
  publish_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  total?: number
  page?: number
  page_size?: number
}

export interface LoginForm {
  username: string
  password: string
}

export interface RegisterForm {
  username: string
  password: string
  email: string
  nickname?: string
}

export interface CreateTopicForm {
  title: string
  content: string
  board_id: number
  type_id?: number
}

export interface CreateReplyForm {
  content: string
  topic_id: number
  parent_id?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  page_size: number
}
