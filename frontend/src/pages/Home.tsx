import React, { useState, useEffect } from 'react'
import { Row, Col, Card, List, Tag, Typography, Statistic, Empty } from 'antd'
import { EyeOutlined, MessageOutlined, FireOutlined, TeamOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { topicApi, boardApi, announcementApi } from '../services/api'
import type { Topic, Board, Announcement } from '../types'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const Home: React.FC = () => {
  const [hotTopics, setHotTopics] = useState<Topic[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [topicsRes, boardsRes, announcementsRes] = await Promise.all([
        topicApi.getHotTopics({ limit: 10 }),
        boardApi.getBoards(),
        announcementApi.getAnnouncements({ page_size: 5 }),
      ])
      setHotTopics(topicsRes.data)
      setBoards(boardsRes.data)
      setAnnouncements(announcementsRes.data?.data || [])
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const popularBoards = boards
    .slice()
    .sort((a, b) => b.post_count - a.post_count)
    .slice(0, 6)

  return (
    <div>
      <Title level={3}>
        <FireOutlined style={{ color: '#faad14', marginRight: 8 }} />
        热门话题
      </Title>

      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {hotTopics.length > 0 ? (
          hotTopics.map((topic) => (
            <Col xs={24} sm={12} key={topic.id}>
              <Card
                className="topic-card"
                hoverable
                onClick={() => navigate(`/topic/${topic.id}`)}
              >
                <div className="topic-title">{topic.title}</div>
                <div className="topic-meta">
                  <span>{topic.user?.nickname || topic.user?.username}</span>
                  <span>
                    <EyeOutlined style={{ marginRight: 4 }} />
                    {topic.view_count}
                  </span>
                  <span>
                    <MessageOutlined style={{ marginRight: 4 }} />
                    {topic.reply_count}
                  </span>
                  <span>{dayjs(topic.created_at).format('MM-DD HH:mm')}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  {topic.is_top && (
                    <Tag color="red" style={{ marginRight: 4 }}>
                      置顶
                    </Tag>
                  )}
                  {topic.is_essence && (
                    <Tag color="gold" style={{ marginRight: 4 }}>
                      精华
                    </Tag>
                  )}
                  {topic.type && <Tag color={topic.type.color}>{topic.type.name}</Tag>}
                </div>
              </Card>
            </Col>
          ))
        ) : (
          <Col span={24}>
            <Empty description="暂无热门话题" />
          </Col>
        )}
      </Row>

      <Row gutter={[24, 0]}>
        <Col xs={24} md={16}>
          <Title level={3}>
            <TeamOutlined style={{ color: '#1890ff', marginRight: 8 }} />
            人气板块
          </Title>
          <Row gutter={[16, 16]}>
            {popularBoards.map((board) => (
              <Col xs={12} sm={8} key={board.id}>
                <Card
                  hoverable
                  onClick={() => navigate(`/boards?board=${board.id}`)}
                  style={{ textAlign: 'center' }}
                >
                  <Statistic
                    title={board.name}
                    value={board.post_count}
                    suffix="帖"
                  />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {board.view_count} 浏览
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Col>

        <Col xs={24} md={8}>
          <Title level={3}>
            <FireOutlined style={{ color: '#f5222d', marginRight: 8 }} />
            最新公告
          </Title>
          <Card>
            <List
              dataSource={announcements}
              renderItem={(item) => (
                <List.Item
                  className="announcement-item"
                  onClick={() => navigate(`/announcement/${item.id}`)}
                >
                  <div className="announcement-title">
                    {item.is_top && (
                      <Tag color="red" style={{ marginRight: 8 }}>
                        置顶
                      </Tag>
                    )}
                    {item.title}
                  </div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {dayjs(item.created_at).format('MM-DD HH:mm')}
                  </Text>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Home
