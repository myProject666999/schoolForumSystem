import React, { useState, useEffect } from 'react'
import { Layout, Menu, Avatar, Dropdown, Button, Input, Badge, message } from 'antd'
import {
  HomeOutlined,
  ClockCircleOutlined,
  AppstoreOutlined,
  SoundOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { boardApi } from '../services/api'
import type { MenuProps } from 'antd'
import type { Board, BoardCategory } from '../types'

const { Header, Content, Sider, Footer } = Layout

const UserLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [boards, setBoards] = useState<Board[]>([])
  const [categories, setCategories] = useState<BoardCategory[]>([])
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [boardsRes, categoriesRes] = await Promise.all([
        boardApi.getBoards(),
        boardApi.getCategories(),
      ])
      setBoards(boardsRes.data)
      setCategories(categoriesRes.data)
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return 'home'
    if (path === '/latest') return 'latest'
    if (path === '/boards') return 'boards'
    if (path === '/announcements') return 'announcements'
    if (path.startsWith('/topic')) return 'latest'
    return 'home'
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人中心',
      onClick: () => navigate(`/user/${user?.id}`),
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '修改密码',
      onClick: () => navigate('/settings'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout()
        message.success('已退出登录')
        navigate('/login')
      },
    },
  ]

  const adminMenuItems: MenuProps['items'] = user?.role === 'admin' ? [
    {
      key: 'admin',
      label: '管理后台',
      onClick: () => navigate('/admin'),
    },
  ] : []

  const menuItems: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '首页',
      onClick: () => navigate('/'),
    },
    {
      key: 'latest',
      icon: <ClockCircleOutlined />,
      label: '最新',
      onClick: () => navigate('/latest'),
    },
    {
      key: 'boards',
      icon: <AppstoreOutlined />,
      label: '板块',
      onClick: () => navigate('/boards'),
      children: categories.map(cat => ({
        key: `category-${cat.id}`,
        label: cat.name,
        onClick: () => navigate(`/boards?category=${cat.id}`),
      })),
    },
    {
      key: 'announcements',
      icon: <SoundOutlined />,
      label: '公告',
      onClick: () => navigate('/announcements'),
    },
    ...adminMenuItems,
  ]

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value)}`)
    }
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        background: '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1890ff' }}>
            🏫 学校论坛
          </div>
          <Input.Search
            placeholder="搜索帖子..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <Link to="/create-topic">
                <Button type="primary" icon={<PlusOutlined />}>
                  发布新帖
                </Button>
              </Link>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Avatar size="large" icon={<UserOutlined />} src={user.avatar} />
                  <span>{user.nickname || user.username}</span>
                </div>
              </Dropdown>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button>登录</Button>
              </Link>
              <Link to="/register">
                <Button type="primary">注册</Button>
              </Link>
            </>
          )}
        </div>
      </Header>

      <Layout>
        <Sider
          width={200}
          style={{ background: '#fff' }}
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
        >
          <Menu
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>

        <Layout style={{ padding: '24px' }}>
          <Content style={{ background: '#fff', padding: 24, margin: 0, minHeight: 280 }}>
            <Outlet />
          </Content>
          <Footer style={{ textAlign: 'center', background: '#fff', margin: '24px 0 0 0' }}>
            学校论坛系统 ©{new Date().getFullYear()} Created by School Forum Team
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default UserLayout
