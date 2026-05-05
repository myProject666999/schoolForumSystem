import React, { useState, useEffect } from 'react'
import { List, Card, Tag, Typography, Empty, Spin, Pagination } from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { announcementApi } from '../services/api'
import type { Announcement } from '../types'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const navigate = useNavigate()

  useEffect(() => {
    loadAnnouncements()
  }, [page])

  const loadAnnouncements = async () => {
    setLoading(true)
    try {
      const response = await announcementApi.getAnnouncements({
        page,
        page_size: pageSize,
        status: 'published',
      })
      setAnnouncements(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      console.error('加载公告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={3}>公告列表</Title>

      <Spin spinning={loading}>
        <List
          dataSource={announcements}
          locale={{ emptyText: '暂无公告' }}
          renderItem={(item) => (
            <List.Item className="topic-card" style={{ padding: 0, border: 'none' }}>
              <Card
                hoverable
                onClick={() => navigate(`/announcement/${item.id}`)}
                style={{ width: '100%' }}
              >
                <div className="topic-title">
                  {item.is_top && (
                    <Tag color="red" style={{ marginRight: 8 }}>
                      置顶
                    </Tag>
                  )}
                  {item.title}
                </div>
                <div className="topic-meta" style={{ marginTop: 8 }}>
                  <span>作者: {item.author?.nickname || item.author?.username}</span>
                  <span>
                    <Text type="secondary">浏览: {item.view_count}</Text>
                  </span>
                  <span>{dayjs(item.created_at).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              </Card>
            </List.Item>
          )}
        />

        {total > 0 && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={total}
              onChange={setPage}
              showSizeChanger={false}
            />
          </div>
        )}
      </Spin>
    </div>
  )
}

const AnnouncementDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [announcement, setAnnouncement] = useState<Announcement | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      loadAnnouncement(parseInt(id))
    }
  }, [id])

  const loadAnnouncement = async (announcementId: number) => {
    setLoading(true)
    try {
      const response = await announcementApi.getAnnouncement(announcementId)
      setAnnouncement(response.data)
    } catch (error) {
      console.error('加载公告失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 50 }} />
  }

  if (!announcement) {
    return <Empty description="公告不存在" />
  }

  return (
    <div>
      <Card>
        <Title level={3}>
          {announcement.is_top && (
            <Tag color="red" style={{ marginRight: 8 }}>
              置顶
            </Tag>
          )}
          {announcement.title}
        </Title>
        <div className="topic-meta" style={{ marginBottom: 24 }}>
          <span>作者: {announcement.author?.nickname || announcement.author?.username}</span>
          <span>浏览: {announcement.view_count}</span>
          <span>{dayjs(announcement.created_at).format('YYYY-MM-DD HH:mm')}</span>
        </div>
        <div className="detail-content" style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>
          {announcement.content}
        </div>
      </Card>
    </div>
  )
}

export { AnnouncementDetail }
export default Announcements
