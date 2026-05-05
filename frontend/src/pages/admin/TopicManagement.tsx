import React, { useState, useEffect } from 'react'
import { Table, Button, Input, InputNumber, Space, Modal, Form, Select, Popconfirm, message, Typography, Tag, Switch, Descriptions } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { topicApi, topicTypeApi } from '../../services/api'
import type { Topic, TopicType } from '../../types'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const TopicManagement: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>([])
  const [topicTypes, setTopicTypes] = useState<TopicType[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchStatus, setSearchStatus] = useState<string>('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [typeModalVisible, setTypeModalVisible] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [editingType, setEditingType] = useState<TopicType | null>(null)
  const [form] = Form.useForm()
  const [typeForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [page, searchKeyword, searchStatus])

  const loadData = async () => {
    setLoading(true)
    try {
      const [topicsRes, typesRes] = await Promise.all([
        topicApi.getTopics({
          page,
          page_size: pageSize,
          keyword: searchKeyword || undefined,
          status: searchStatus || undefined,
        }),
        topicTypeApi.getTopicTypes(),
      ])
      setTopics(topicsRes.data?.data || [])
      setTotal(topicsRes.data?.total || 0)
      setTopicTypes(typesRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = (record: Topic) => {
    setSelectedTopic(record)
    setDetailModalVisible(true)
  }

  const handleEdit = (record: Topic) => {
    setSelectedTopic(record)
    form.setFieldsValue({
      title: record.title,
      content: record.content,
      type_id: record.type_id,
      is_top: record.is_top,
      is_essence: record.is_essence,
      status: record.status,
    })
    setEditModalVisible(true)
  }

  const handleDelete = async (record: Topic) => {
    try {
      await topicApi.deleteTopic(record.id)
      message.success('删除成功')
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败')
    }
  }

  const handleEditSubmit = async (values: any) => {
    if (!selectedTopic) return
    try {
      await topicApi.updateTopic(selectedTopic.id, values)
      message.success('更新成功')
      setEditModalVisible(false)
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '更新失败')
    }
  }

  const handleAddType = () => {
    setEditingType(null)
    typeForm.resetFields()
    setTypeModalVisible(true)
  }

  const handleEditType = (record: TopicType) => {
    setEditingType(record)
    typeForm.setFieldsValue({
      name: record.name,
      color: record.color,
      sort_order: record.sort_order,
    })
    setTypeModalVisible(true)
  }

  const handleDeleteType = async (record: TopicType) => {
    try {
      await topicTypeApi.deleteTopicType(record.id)
      message.success('删除成功')
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败')
    }
  }

  const handleTypeSubmit = async (values: {
    name: string
    color: string
    sort_order: number
  }) => {
    try {
      if (editingType) {
        await topicTypeApi.updateTopicType(editingType.id, values)
      } else {
        await topicTypeApi.createTopicType(values)
      }
      message.success('操作成功')
      setTypeModalVisible(false)
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败')
    }
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'normal':
        return <Tag color="green">正常</Tag>
      case 'hidden':
        return <Tag color="orange">隐藏</Tag>
      case 'deleted':
        return <Tag color="red">已删除</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 200,
    },
    {
      title: '作者',
      dataIndex: ['user', 'username'],
      key: 'user',
      width: 100,
    },
    {
      title: '板块',
      dataIndex: ['board', 'name'],
      key: 'board',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: ['type', 'name'],
      key: 'type',
      width: 80,
      render: (name: string, record: Topic) => (
        record.type ? <Tag color={record.type.color}>{name}</Tag> : '-'
      ),
    },
    {
      title: '置顶',
      dataIndex: 'is_top',
      key: 'is_top',
      width: 60,
      render: (val: boolean) => (
        <Tag color={val ? 'red' : 'default'}>{val ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '精华',
      dataIndex: 'is_essence',
      key: 'is_essence',
      width: 60,
      render: (val: boolean) => (
        <Tag color={val ? 'gold' : 'default'}>{val ? '是' : '否'}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Topic) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            详情
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该主题帖吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  const typeColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '类型名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '颜色',
      dataIndex: 'color',
      key: 'color',
      render: (color: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 20,
              height: 20,
              backgroundColor: color,
              borderRadius: 4,
            }}
          />
          <span>{color}</span>
        </div>
      ),
    },
    {
      title: '排序',
      dataIndex: 'sort_order',
      key: 'sort_order',
      width: 100,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: TopicType) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditType(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该类型吗？"
            onConfirm={() => handleDeleteType(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        主题帖管理
      </Title>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索标题/内容"
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="状态筛选"
            value={searchStatus || undefined}
            onChange={setSearchStatus}
            style={{ width: 120 }}
            allowClear
          >
            <Option value="">全部</Option>
            <Option value="normal">正常</Option>
            <Option value="hidden">隐藏</Option>
            <Option value="deleted">已删除</Option>
          </Select>
          <Button type="primary" onClick={loadData}>
            搜索
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={topics}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: false,
          onChange: setPage,
        }}
      />

      <Title level={4} style={{ marginTop: 48, marginBottom: 16 }}>
        主题帖类型管理
      </Title>

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<EditOutlined />} onClick={handleAddType}>
          添加类型
        </Button>
      </div>

      <Table
        columns={typeColumns}
        dataSource={topicTypes}
        rowKey="id"
        pagination={false}
      />

      <Modal
        title="主题帖详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTopic && (
          <div>
            <Descriptions bordered column={2}>
              <Descriptions.Item label="ID">{selectedTopic.id}</Descriptions.Item>
              <Descriptions.Item label="标题">{selectedTopic.title}</Descriptions.Item>
              <Descriptions.Item label="作者">
                {selectedTopic.user?.nickname || selectedTopic.user?.username}
              </Descriptions.Item>
              <Descriptions.Item label="板块">
                {selectedTopic.board?.name}
              </Descriptions.Item>
              <Descriptions.Item label="类型">
                {selectedTopic.type ? (
                  <Tag color={selectedTopic.type.color}>
                    {selectedTopic.type.name}
                  </Tag>
                ) : (
                  '-'
                )}
              </Descriptions.Item>
              <Descriptions.Item label="置顶">
                <Tag color={selectedTopic.is_top ? 'red' : 'default'}>
                  {selectedTopic.is_top ? '是' : '否'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="精华">
                <Tag color={selectedTopic.is_essence ? 'gold' : 'default'}>
                  {selectedTopic.is_essence ? '是' : '否'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                {getStatusTag(selectedTopic.status)}
              </Descriptions.Item>
              <Descriptions.Item label="浏览量">
                {selectedTopic.view_count}
              </Descriptions.Item>
              <Descriptions.Item label="回复数">
                {selectedTopic.reply_count}
              </Descriptions.Item>
              <Descriptions.Item label="点赞数">
                {selectedTopic.like_count}
              </Descriptions.Item>
              <Descriptions.Item label="发布时间">
                {dayjs(selectedTopic.created_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="更新时间">
                {dayjs(selectedTopic.updated_at).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </Descriptions>
            <Title level={5} style={{ marginTop: 24 }}>
              内容：
            </Title>
            <div
              style={{
                whiteSpace: 'pre-wrap',
                padding: 16,
                backgroundColor: '#f5f5f5',
                borderRadius: 4,
              }}
            >
              {selectedTopic.content}
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="编辑主题帖"
        open={editModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setEditModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="title" label="标题">
            <Input placeholder="请输入标题" />
          </Form.Item>
          <Form.Item name="content" label="内容">
            <TextArea rows={6} placeholder="请输入内容" />
          </Form.Item>
          <Form.Item name="type_id" label="帖子类型">
            <Select placeholder="请选择帖子类型" allowClear>
              {topicTypes.map((type) => (
                <Option key={type.id} value={type.id}>
                  <Tag color={type.color}>{type.name}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="is_top" label="是否置顶" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="is_essence" label="是否精华" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="normal">正常</Option>
              <Option value="hidden">隐藏</Option>
              <Option value="deleted">已删除</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingType ? '编辑类型' : '添加类型'}
        open={typeModalVisible}
        onOk={() => typeForm.submit()}
        onCancel={() => setTypeModalVisible(false)}
      >
        <Form form={typeForm} layout="vertical" onFinish={handleTypeSubmit}>
          <Form.Item
            name="name"
            label="类型名称"
            rules={[{ required: true, message: '请输入类型名称' }]}
          >
            <Input placeholder="请输入类型名称" />
          </Form.Item>
          <Form.Item name="color" label="颜色">
            <Input type="color" style={{ width: 100 }} />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default TopicManagement
