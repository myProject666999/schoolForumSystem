import axios from 'axios'
import type {
  User,
  Board,
  BoardCategory,
  Topic,
  TopicType,
  Reply,
  Announcement,
  College,
  Association,
  LoginForm,
  RegisterForm,
  CreateTopicForm,
  CreateReplyForm,
  PaginatedResponse,
  ApiResponse,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface LoginResponse {
  message?: string
  token: string
  user: User
}

export const authApi = {
  login: (data: LoginForm) => api.post<LoginResponse>('/auth/login', data),
  register: (data: RegisterForm) => api.post<LoginResponse>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get<User>('/auth/me'),
  changePassword: (data: { old_password: string; new_password: string }) =>
    api.put('/auth/password', data),
}

export const userApi = {
  getUsers: (params?: { page?: number; page_size?: number; keyword?: string; status?: string }) =>
    api.get<PaginatedResponse<User>>('/users', { params }),
  getUser: (id: number) => api.get<User>(`/users/${id}`),
  updateUser: (id: number, data: Partial<User>) => api.put(`/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/users/${id}`),
  getUserTopics: (id: number, params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Topic>>(`/users/${id}/topics`, { params }),
  getUserReplies: (id: number, params?: { page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Reply>>(`/users/${id}/replies`, { params }),
}

export const boardApi = {
  getCategories: () => api.get<BoardCategory[]>('/board-categories'),
  createCategory: (data: { name: string; description?: string; sort_order?: number }) =>
    api.post('/board-categories', data),
  updateCategory: (id: number, data: { name?: string; description?: string; sort_order?: number }) =>
    api.put(`/board-categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/board-categories/${id}`),

  getBoards: (params?: { category_id?: number; status?: string }) =>
    api.get<Board[]>('/boards', { params }),
  getBoard: (id: number) => api.get<Board>(`/boards/${id}`),
  createBoard: (data: {
    name: string
    description?: string
    icon?: string
    category_id: number
    college_id?: number
    association_id?: number
    sort_order?: number
  }) => api.post('/boards', data),
  updateBoard: (id: number, data: Partial<Board>) => api.put(`/boards/${id}`, data),
  deleteBoard: (id: number) => api.delete(`/boards/${id}`),

  getColleges: () => api.get<College[]>('/colleges'),
  getAssociations: (params?: { college_id?: number }) =>
    api.get<Association[]>('/associations', { params }),
}

export const topicTypeApi = {
  getTopicTypes: () => api.get<TopicType[]>('/topic-types'),
  createTopicType: (data: { name: string; color?: string; sort_order?: number }) =>
    api.post('/topic-types', data),
  updateTopicType: (id: number, data: { name?: string; color?: string; sort_order?: number }) =>
    api.put(`/topic-types/${id}`, data),
  deleteTopicType: (id: number) => api.delete(`/topic-types/${id}`),
}

export const topicApi = {
  getTopics: (params?: {
    page?: number
    page_size?: number
    board_id?: number
    keyword?: string
    status?: string
  }) => api.get<PaginatedResponse<Topic>>('/topics', { params }),
  getHotTopics: (params?: { limit?: number }) => api.get<Topic[]>('/topics/hot', { params }),
  getLatestTopics: (params?: { limit?: number }) => api.get<Topic[]>('/topics/latest', { params }),
  searchTopics: (params: { keyword: string; page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Topic>>('/topics/search', { params }),
  getTopic: (id: number) => api.get<Topic>(`/topics/${id}`),
  createTopic: (data: CreateTopicForm) => api.post('/topics', data),
  updateTopic: (id: number, data: Partial<Topic>) => api.put(`/topics/${id}`, data),
  deleteTopic: (id: number) => api.delete(`/topics/${id}`),
}

export const replyApi = {
  getReplies: (params: { topic_id: number; page?: number; page_size?: number }) =>
    api.get<PaginatedResponse<Reply>>('/replies', { params }),
  getReply: (id: number) => api.get<Reply>(`/replies/${id}`),
  createReply: (data: CreateReplyForm) => api.post('/replies', data),
  deleteReply: (id: number) => api.delete(`/replies/${id}`),
}

export const announcementApi = {
  getAnnouncements: (params?: { page?: number; page_size?: number; status?: string }) =>
    api.get<PaginatedResponse<Announcement>>('/announcements', { params }),
  getAnnouncement: (id: number) => api.get<Announcement>(`/announcements/${id}`),
  createAnnouncement: (data: { title: string; content: string; is_top?: boolean; status?: string }) =>
    api.post('/announcements', data),
  updateAnnouncement: (id: number, data: Partial<Announcement>) =>
    api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id: number) => api.delete(`/announcements/${id}`),
}

export const databaseApi = {
  getTables: () => api.get<{ table_name: string; table_comment: string; table_rows: number }[]>('/database/tables'),
  getTableStructure: (params: { table_name: string }) =>
    api.get('/database/structure', { params }),
  getTableRecords: (params: { table_name: string; page?: number; page_size?: number }) =>
    api.get('/database/records', { params }),
}

export default api
