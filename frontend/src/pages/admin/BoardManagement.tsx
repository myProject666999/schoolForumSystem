import React, { useState, useEffect } from 'react'
import { Table, Button, Tabs, Modal, Form, Input, Select, Space, Popconfirm, message, Typography, InputNumber } from 'antd'
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { boardApi } from '../../services/api'
import type { Board, BoardCategory } from '../../types'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const BoardManagement: React.FC = () => {
  const [categories, setCategories] = useState<BoardCategory[]>([])
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('categories')
  const [categoryModalVisible, setCategoryModalVisible] = useState(false)
  const [boardModalVisible, setBoardModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BoardCategory | null>(null)
  const [editingBoard, setEditingBoard] = useState<Board | null>(null)
  const [colleges, setColleges] = useState<any[]>([])
  const [associations, setAssociations] = useState<any[]>([])
  const [form] = Form.useForm()
  const [boardForm] = Form.useForm()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [categoriesRes, boardsRes, collegesRes, associationsRes] = await Promise.all([
        boardApi.getCategories(),
        boardApi.getBoards(),
        boardApi.getColleges(),
        boardApi.getAssociations(),
      ])
      setCategories(categoriesRes.data)
      setBoards(boardsRes.data)
      setColleges(collegesRes.data)
      setAssociations(associationsRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
      message.error('加载数据失败')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = () => {
    setEditingCategory(null)
    form.resetFields()
    setCategoryModalVisible(true)
  }

  const handleEditCategory = (record: BoardCategory) => {
    setEditingCategory(record)
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      sort_order: record.sort_order,
    })
    setCategoryModalVisible(true)
  }

  const handleDeleteCategory = async (record: BoardCategory) => {
    try {
      await boardApi.deleteCategory(record.id)
      message.success('删除成功')
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败')
    }
  }

  const handleAddBoard = () => {
    setEditingBoard(null)
    boardForm.resetFields()
    setBoardModalVisible(true)
  }

  const handleEditBoard = (record: Board) => {
    setEditingBoard(record)
    boardForm.setFieldsValue({
      name: record.name,
      description: record.description,
      icon: record.icon,
      category_id: record.category_id,
      college_id: record.college_id,
      association_id: record.association_id,
      sort_order: record.sort_order,
      status: record.status,
    })
    setBoardModalVisible(true)
  }

  const handleDeleteBoard = async (record: Board) => {
    try {
      await boardApi.deleteBoard(record.id)
      message.success('删除成功')
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败')
    }
  }

  const handleCategorySubmit = async (values: {
    name: string
    description: string
    sort_order: number
  }) => {
    try {
      if (editingCategory) {
        await boardApi.updateCategory(editingCategory.id, values)
      } else {
        await boardApi.createCategory(values)
      }
      message.success('操作成功')
      setCategoryModalVisible(false)
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败')
    }
  }

  const handleBoardSubmit = async (values: any) => {
    try {
      if (editingBoard) {
        await boardApi.updateBoard(editingBoard.id, values)
      } else {
        await boardApi.createBoard(values)
      }
      message.success('操作成功')
      setBoardModalVisible(false)
      loadData()
    } catch (error: any) {
      message.error(error.response?.data?.error || '操作失败')
    }
  }

  const categoryColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
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
      render: (_: any, record: BoardCategory) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditCategory(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该分类吗？"
            onConfirm={() => handleDeleteCategory(record)}
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

  const boardColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '板块名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (name: string) => name || '-',
    },
    {
      title: '帖子数',
      dataIndex: 'post_count',
      key: 'post_count',
      width: 100,
    },
    {
      title: '浏览量',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <span style={{ color: status === 'active' ? 'green' : 'red' }}>
          {status === 'active' ? '显示' : '隐藏'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: Board) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditBoard(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该板块吗？"
            onConfirm={() => handleDeleteBoard(record)}
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

  const tabItems = [
    {
      key: 'categories',
      label: (
        <span>
          <PlusOutlined /> 板块分类管理
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddCategory}>
              添加分类
            </Button>
          </div>
          <Table
            columns={categoryColumns}
            dataSource={categories}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </>
      ),
    },
    {
      key: 'boards',
      label: (
        <span>
          <PlusOutlined /> 板块管理
        </span>
      ),
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddBoard}>
              添加板块
            </Button>
          </div>
          <Table
            columns={boardColumns}
            dataSource={boards}
            rowKey="id"
            loading={loading}
            pagination={false}
          />
        </>
      ),
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        板块管理
      </Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title={editingCategory ? '编辑分类' : '添加分类'}
        open={categoryModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setCategoryModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleCategorySubmit}>
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={editingBoard ? '编辑板块' : '添加板块'}
        open={boardModalVisible}
        onOk={() => boardForm.submit()}
        onCancel={() => setBoardModalVisible(false)}
        width={600}
      >
        <Form form={boardForm} layout="vertical" onFinish={handleBoardSubmit}>
          <Form.Item
            name="name"
            label="板块名称"
            rules={[{ required: true, message: '请输入板块名称' }]}
          >
            <Input placeholder="请输入板块名称" />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <TextArea rows={3} placeholder="请输入描述" />
          </Form.Item>
          <Form.Item
            name="category_id"
            label="所属分类"
            rules={[{ required: true, message: '请选择分类' }]}
          >
            <Select placeholder="请选择分类">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="college_id" label="关联学院">
            <Select placeholder="请选择学院（可选）" allowClear>
              {colleges.map((col) => (
                <Option key={col.id} value={col.id}>
                  {col.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="association_id" label="关联协会">
            <Select placeholder="请选择协会（可选）" allowClear>
              {associations.map((asso) => (
                <Option key={asso.id} value={asso.id}>
                  {asso.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="sort_order" label="排序">
            <InputNumber min={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="active">显示</Option>
              <Option value="hidden">隐藏</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default BoardManagement
