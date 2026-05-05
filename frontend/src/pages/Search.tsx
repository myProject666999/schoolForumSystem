import React, { useState, useEffect } from 'react'
import { List, Card, Tag, Typography, Empty, Spin, Pagination, Input, message } from 'antd'
import { EyeOutlined, MessageOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { topicApi } from '../services/api'
import type { Topic } from '../types'
import dayjs from 'dayjs'

const { Title } = Typography

const Search: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchValue, setSearchValue] = useState('')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const keyword = searchParams.get('keyword') || ''

  useEffect(() => {
    if (keyword) {
      setSearchValue(keyword)
      searchTopics(keyword)
    }
  }, [keyword, page])

  const searchTopics = async (query: string) => {
    if (!query.trim()) return
    setLoading(true)
    try {
      const response = await topicApi.searchTopics({
        keyword: query,
        page,
        page_size: pageSize,
      })
      setTopics(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error: any) {
      message.error(error.response?.data?.error || '搜索失败')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`)
    }
  }

  return (
    <div>
      <Title level={3}>
        <SearchOutlined style={{ marginRight: 8 }} />
        搜索
      </Title>

      <Input.Search
        placeholder="搜索帖子内容..."
        allowClear
        size="large"
        onSearch={handleSearch}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        style={{ maxWidth: 600, marginBottom: 24 }}
      />

      {keyword && (
        <Title level={4} style={{ marginBottom: 16 }}>
          搜索 "{keyword}" 的结果 ({total} 条)
        </Title>
      )}

      <Spin spinning={loading}>
        {topics.length > 0 ? (
          <>
            <List
              dataSource={topics}
              renderItem={(topic) => (
                <List.Item className="topic-card" style={{ padding: 0, border: 'none' }}>
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
          </>
        ) : (
          !loading && keyword && <Empty description="没有找到相关帖子" />
        )}
      </Spin>
    </div>
  )
}

export default Search
