import React, { useState, useEffect } from 'react'
import { Row, Col, Card, List, Tag, Typography, Empty, Spin, Tabs, Pagination } from 'antd'
import { EyeOutlined, MessageOutlined, FileTextOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { boardApi, topicApi } from '../services/api'
import type { Board, BoardCategory, Topic } from '../types'
import dayjs from 'dayjs'

const { Title, Text } = Typography

const Boards: React.FC = () => {
  const [categories, setCategories] = useState<BoardCategory[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [topicsLoading, setTopicsLoading] = useState(false)
  const [selectedBoard, setSelectedBoard] = useState<number | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const boardId = searchParams.get('board')
    if (boardId) {
      setSelectedBoard(parseInt(boardId))
      loadTopics(parseInt(boardId))
    }
  }, [searchParams])

  const loadData = async () => {
    setLoading(true)
    try {
      const [categoriesRes, boardsRes] = await Promise.all([
        boardApi.getCategories(),
        boardApi.getBoards(),
      ])
      setCategories(categoriesRes.data)
      setBoards(boardsRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTopics = async (boardId: number) => {
    setTopicsLoading(true)
    try {
      const response = await topicApi.getTopics({
        board_id: boardId,
        page,
        page_size: pageSize,
        status: 'normal',
      })
      setTopics(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      console.error('加载帖子失败:', error)
    } finally {
      setTopicsLoading(false)
    }
  }

  const handleBoardClick = (boardId: number) => {
    setSelectedBoard(boardId)
    setPage(1)
    navigate(`/boards?board=${boardId}`)
    loadTopics(boardId)
  }

  useEffect(() => {
    if (selectedBoard) {
      loadTopics(selectedBoard)
    }
  }, [page])

  const getBoardsByCategory = (categoryId: number) => {
    return boards.filter((board) => board.category_id === categoryId)
  }

  const selectedBoardInfo = boards.find((b) => b.id === selectedBoard)

  if (loading) {
    return (
      <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 50 }} />
    )
  }

  return (
    <div>
      <Title level={3}>
        <FileTextOutlined style={{ marginRight: 8 }} />
        板块列表
      </Title>

      <Row gutter={[24, 0]}>
        <Col xs={24} md={6}>
          <Card>
            <List
              dataSource={categories}
              renderItem={(category) => (
                <div key={category.id}>
                  <div className="category-title">{category.name}</div>
                  <List
                    dataSource={getBoardsByCategory(category.id)}
                    renderItem={(board) => (
                      <div
                        className="board-item"
                        onClick={() => handleBoardClick(board.id)}
                        style={{
                          background: selectedBoard === board.id ? '#e6f7ff' : 'transparent',
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{board.name}</div>
                        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                          {board.post_count} 帖 · {board.view_count} 浏览
                        </div>
                      </div>
                    )}
                  />
                </div>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={18}>
          <Card
            title={selectedBoardInfo ? selectedBoardInfo.name : '请选择板块'}
            extra={
              selectedBoardInfo && (
                <Text type="secondary">
                  共 {selectedBoardInfo.post_count} 篇帖子
                </Text>
              )
            }
          >
            {selectedBoard ? (
              <Spin spinning={topicsLoading}>
                {topics.length > 0 ? (
                  <>
                    <List
                      dataSource={topics}
                      renderItem={(topic) => (
                        <List.Item
                          className="topic-card"
                          style={{ padding: 0, border: 'none' }}
                        >
                          <Card
                            hoverable
                            onClick={() => navigate(`/topic/${topic.id}`)}
                            style={{ width: '100%' }}
                          >
                            <div className="topic-title">{topic.title}</div>
                            <div className="topic-meta" style={{ marginTop: 8 }}>
                              <span>{topic.user?.nickname || topic.user?.username}</span>
                              <span>
                                <EyeOutlined style={{ marginRight: 4 }} />
                                {topic.view_count}
                              </span>
                              <span>
                                <MessageOutlined style={{ marginRight: 4 }} />
                                {topic.reply_count}
                              </span>
                              <span>
                                {dayjs(topic.created_at).format('MM-DD HH:mm')}
                              </span>
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
                              {topic.type && (
                                <Tag color={topic.type.color}>{topic.type.name}</Tag>
                              )}
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
                  </>
                ) : (
                  <Empty description="该板块暂无帖子" />
                )}
              </Spin>
            ) : (
              <Empty description="请从左侧选择一个板块" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Boards
