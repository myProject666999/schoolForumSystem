import React, { useState } from 'react'
import { Layout, Menu, theme } from 'antd'
import {
  UserOutlined,
  AppstoreOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  HomeOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { MenuProps } from 'antd'

const { Header, Content, Sider, Footer } = Layout

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/admin/users') return 'users'
    if (path === '/admin/boards') return 'boards'
    if (path === '/admin/topics') return 'topics'
    if (path === '/admin/database') return 'database'
    return 'users'
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: 'boards',
      icon: <AppstoreOutlined />,
      label: '板块管理',
      onClick: () => navigate('/admin/boards'),
    },
    {
      key: 'topics',
      icon: <FileTextOutlined />,
      label: '主题帖管理',
      onClick: () => navigate('/admin/topics'),
    },
    {
      key: 'database',
      icon: <DatabaseOutlined />,
      label: '数据表',
      onClick: () => navigate('/admin/database'),
    },
  ]

  const headerMenuItems: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: '返回前台',
      onClick: () => navigate('/'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: () => {
        logout()
        navigate('/login')
      },
    },
  ]

  return (
    <Layout className="admin-layout" style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: collapsed ? 14 : 18,
            fontWeight: 'bold',
          }}
        >
          {collapsed ? '论坛' : '学校论坛管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ fontSize: 18, fontWeight: 500 }}>
            欢迎，{user?.nickname || user?.username} (管理员)
          </div>
          <Menu mode="horizontal" selectedKeys={[]} items={headerMenuItems} />
        </Header>
        <Content style={{ margin: '24px', padding: 24, background: colorBgContainer, minHeight: 280 }}>
          <Outlet />
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          学校论坛系统 ©{new Date().getFullYear()} Created by School Forum Team
        </Footer>
      </Layout>
    </Layout>
  )
}

export default AdminLayout
