import React, { useState, useEffect } from 'react'
import { List, Card, Tag, Typography, Empty, Pagination, Spin, Button, Modal, Form, Input, InputNumber, Select, message } from 'antd'
import { EyeOutlined, MessageOutlined, LikeOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { topicApi, replyApi, boardApi, topicTypeApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { Topic, Board, TopicType, Reply } from '../types'
import dayjs from 'dayjs'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

const Latest: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    loadTopics()
  }, [page])

  const loadTopics = async () => {
    setLoading(true)
    try {
      const response = await topicApi.getTopics({
        page,
        page_size: pageSize,
        status: 'normal',
      })
      setTopics(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      console.error('加载帖子失败:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Title level={3}>最新帖子</Title>

      <Spin spinning={loading}>
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
                  <span>作者: {topic.user?.nickname || topic.user?.username}</span>
                  <span>板块: {topic.board?.name}</span>
                  <span>
                    <EyeOutlined style={{ marginRight: 4 }} />
                    {topic.view_count}
                  </span>
                  <span>
                    <MessageOutlined style={{ marginRight: 4 }} />
                    {topic.reply_count}
                  </span>
                  <span>
                    <LikeOutlined style={{ marginRight: 4 }} />
                    {topic.like_count}
                  </span>
                  <span>{dayjs(topic.created_at).format('YYYY-MM-DD HH:mm')}</span>
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

        {!loading && topics.length === 0 && (
          <Empty description="暂无帖子" />
        )}
      </Spin>
    </div>
  )
}

const TopicDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [topic, setTopic] = useState<Topic | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(false)
  const [replyLoading, setReplyLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (id) {
      loadTopic(parseInt(id))
      loadReplies(parseInt(id))
    }
  }, [id, page])

  const loadTopic = async (topicId: number) => {
    setLoading(true)
    try {
      const response = await topicApi.getTopic(topicId)
      setTopic(response.data)
    } catch (error) {
      console.error('加载帖子失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadReplies = async (topicId: number) => {
    try {
      const response = await replyApi.getReplies({
        topic_id: topicId,
        page,
        page_size: pageSize,
      })
      setReplies(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      console.error('加载回复失败:', error)
    }
  }

  const handleSubmitReply = async (values: { content: string }) => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }

    setReplyLoading(true)
    try {
      await replyApi.createReply({
        content: values.content,
        topic_id: parseInt(id || '0'),
      })
      message.success('回复成功')
      form.resetFields()
      loadReplies(parseInt(id || '0'))
    } catch (error: any) {
      message.error(error.response?.data?.error || '回复失败')
    } finally {
      setReplyLoading(false)
    }
  }

  if (loading) {
    return <Spin size="large" style={{ display: 'block', textAlign: 'center', marginTop: 50 }} />
  }

  if (!topic) {
    return <Empty description="帖子不存在" />
  }

  return (
    <div>
      <Card>
        <Title level={3}>{topic.title}</Title>
        <div className="topic-meta" style={{ marginBottom: 16 }}>
          <span>作者: {topic.user?.nickname || topic.user?.username}</span>
          <span>板块: {topic.board?.name}</span>
          <span>
            <EyeOutlined style={{ marginRight: 4 }} />
            {topic.view_count}
          </span>
          <span>
            <MessageOutlined style={{ marginRight: 4 }} />
            {topic.reply_count}
          </span>
          <span>{dayjs(topic.created_at).format('YYYY-MM-DD HH:mm')}</span>
        </div>
        <div style={{ marginBottom: 16 }}>
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
        <div className="detail-content" style={{ whiteSpace: 'pre-wrap' }}>
          {topic.content}
        </div>
      </Card>

      <Card title={`回复 (${total})`} style={{ marginTop: 24 }}>
        {user && (
          <Form form={form} onFinish={handleSubmitReply} style={{ marginBottom: 24 }}>
            <Form.Item
              name="content"
              rules={[{ required: true, message: '请输入回复内容' }]}
            >
              <TextArea
                rows={3}
                placeholder="写下你的回复..."
                maxLength={1000}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={replyLoading}>
                发表回复
              </Button>
            </Form.Item>
          </Form>
        )}

        <List
          dataSource={replies}
          locale={{ emptyText: '暂无回复' }}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: setPage,
            showSizeChanger: false,
          }}
          renderItem={(reply) => (
            <List.Item className="reply-item">
              <List.Item.Meta
                avatar={
                  <Text strong style={{ fontSize: 16 }}>
                    {reply.user?.nickname || reply.user?.username}
                  </Text>
                }
                description={
                  <Text type="secondary">
                    {dayjs(reply.created_at).format('YYYY-MM-DD HH:mm')}
                  </Text>
                }
              />
              <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>{reply.content}</div>
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

const CreateTopic: React.FC = () => {
  const [form] = Form.useForm()
  const [boards, setBoards] = useState<Board[]>([])
  const [topicTypes, setTopicTypes] = useState<TopicType[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      message.warning('请先登录')
      navigate('/login')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      const [boardsRes, typesRes] = await Promise.all([
        boardApi.getBoards(),
        topicTypeApi.getTopicTypes(),
      ])
      setBoards(boardsRes.data)
      setTopicTypes(typesRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const handleSubmit = async (values: {
    title: string
    content: string
    board_id: number
    type_id?: number
  }) => {
    setLoading(true)
    try {
      const response = await topicApi.createTopic({
        title: values.title,
        content: values.content,
        board_id: values.board_id,
        type_id: values.type_id,
      })
      message.success('发布成功')
      navigate(`/topic/${response.data?.id || 0}`)
    } catch (error: any) {
      message.error(error.response?.data?.error || '发布失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-topic-form">
      <Title level={3}>发布新帖</Title>
      <Card>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="board_id"
            label="选择板块"
            rules={[{ required: true, message: '请选择板块' }]}
          >
            <Select placeholder="请选择板块">
              {boards.map((board) => (
                <Option key={board.id} value={board.id}>
                  {board.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="type_id"
            label="帖子类型"
          >
            <Select placeholder="请选择帖子类型（可选）">
              {topicTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  <Tag color={type.color}>{type.name}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="title"
            label="帖子标题"
            rules={[
              { required: true, message: '请输入帖子标题' },
              { max: 200, message: '标题最多200个字符' },
            ]}
          >
            <Input placeholder="请输入帖子标题" maxLength={200} />
          </Form.Item>

          <Form.Item
            name="content"
            label="帖子内容"
            rules={[
              { required: true, message: '请输入帖子内容' },
              { max: 10000, message: '内容最多10000个字符' },
            ]}
          >
            <TextArea rows={12} placeholder="请输入帖子内容" maxLength={10000} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} size="large">
              发布帖子
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export { TopicDetail, CreateTopic }
export default Latest
