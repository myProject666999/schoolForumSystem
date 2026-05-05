import React, { useState } from 'react'
import { Card, Form, Input, Button, message, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import type { LoginForm } from '../types'

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { login } = useAuth()

  const onFinish = async (values: LoginForm) => {
    setLoading(true)
    try {
      const response = await authApi.login(values)
      const { token, user } = response.data
      login(token, user)
      message.success('登录成功')
      if (user.role === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error: any) {
      message.error(error.response?.data?.error || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <Card className="login-card" title="学校论坛系统">
        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>

          <Divider plain>还没有账号？</Divider>

          <Form.Item>
            <Link to="/register">
              <Button block>立即注册</Button>
            </Link>
          </Form.Item>
        </Form>

        <div style={{ fontSize: '12px', color: '#999', textAlign: 'center' }}>
          <p>管理员账号: admin / admin123</p>
        </div>
      </Card>
    </div>
  )
}

export default Login
