import React, { useState, useEffect } from 'react'
import { Table, Button, Input, Space, Modal, Form, Select, message, Popconfirm, Tag, Typography } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import { userApi } from '../../services/api'
import type { User } from '../../types'
import dayjs from 'dayjs'

const { Title } = Typography
const { Option } = Select

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchStatus, setSearchStatus] = useState<string>('')
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    loadUsers()
  }, [page, searchKeyword, searchStatus])

  const loadUsers = async () => {
    setLoading(true)
    try {
      const response = await userApi.getUsers({
        page,
        page_size: pageSize,
        keyword: searchKeyword || undefined,
        status: searchStatus || undefined,
      })
      setUsers(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      console.error('加载用户列表失败:', error)
      message.error('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (record: User) => {
    setEditingUser(record)
    form.setFieldsValue({
      nickname: record.nickname,
      email: record.email,
      status: record.status,
    })
    setEditModalVisible(true)
  }

  const handleDelete = async (record: User) => {
    try {
      await userApi.deleteUser(record.id)
      message.success('删除成功')
      loadUsers()
    } catch (error: any) {
      message.error(error.response?.data?.error || '删除失败')
    }
  }

  const handleEditSubmit = async (values: {
    nickname: string
    email: string
    status: string
  }) => {
    if (!editingUser) return
    try {
      await userApi.updateUser(editingUser.id, {
        nickname: values.nickname,
        email: values.email,
        status: values.status as User['status'],
      })
      message.success('更新成功')
      setEditModalVisible(false)
      loadUsers()
    } catch (error: any) {
      message.error(error.response?.data?.error || '更新失败')
    }
  }

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color="green">正常</Tag>
      case 'banned':
        return <Tag color="orange">禁用</Tag>
      case 'deleted':
        return <Tag color="red">已删除</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const getRoleTag = (role: string) => {
    return role === 'admin' ? (
      <Tag color="purple">管理员</Tag>
    ) : (
      <Tag color="blue">普通用户</Tag>
    )
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => getRoleTag(role),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该用户吗？"
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

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        用户管理
      </Title>

      <div style={{ marginBottom: 16 }}>
        <Space>
          <Input
            placeholder="搜索用户名/昵称/邮箱"
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
            <Option value="active">正常</Option>
            <Option value="banned">禁用</Option>
            <Option value="deleted">已删除</Option>
          </Select>
          <Button type="primary" onClick={loadUsers}>
            搜索
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={users}
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

      <Modal
        title="编辑用户"
        open={editModalVisible}
        onOk={() => form.submit()}
        onCancel={() => setEditModalVisible(false)}
      >
        <Form form={form} layout="vertical" onFinish={handleEditSubmit}>
          <Form.Item name="nickname" label="昵称">
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="active">正常</Option>
              <Option value="banned">禁用</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement
