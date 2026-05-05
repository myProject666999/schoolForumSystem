import React, { useState, useEffect } from 'react'
import { Table, Button, Space, Typography, Tabs, Descriptions, message, Spin } from 'antd'
import { EyeOutlined, TableOutlined } from '@ant-design/icons'
import { databaseApi } from '../../services/api'
import dayjs from 'dayjs'

const { Title } = Typography

const DatabaseManagement: React.FC = () => {
  const [tables, setTables] = useState<any[]>([])
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [tableStructure, setTableStructure] = useState<any[]>([])
  const [tableRecords, setTableRecords] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [structureLoading, setStructureLoading] = useState(false)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)

  useEffect(() => {
    loadTables()
  }, [])

  const loadTables = async () => {
    setLoading(true)
    try {
      const response = await databaseApi.getTables()
      setTables(response.data || [])
    } catch (error) {
      console.error('加载表列表失败:', error)
      message.error('加载表列表失败')
    } finally {
      setLoading(false)
    }
  }

  const loadTableStructure = async (tableName: string) => {
    setStructureLoading(true)
    try {
      const response = await databaseApi.getTableStructure({ table_name: tableName })
      setTableStructure(response.data || [])
    } catch (error) {
      console.error('加载表结构失败:', error)
      message.error('加载表结构失败')
    } finally {
      setStructureLoading(false)
    }
  }

  const loadTableRecords = async (tableName: string) => {
    setRecordsLoading(true)
    try {
      const response = await databaseApi.getTableRecords({
        table_name: tableName,
        page,
        page_size: pageSize,
      })
      setTableRecords(response.data?.data || [])
      setTotal(response.data?.total || 0)
    } catch (error) {
      console.error('加载表记录失败:', error)
      message.error('加载表记录失败')
    } finally {
      setRecordsLoading(false)
    }
  }

  const handleViewTable = (tableName: string) => {
    setSelectedTable(tableName)
    setPage(1)
    loadTableStructure(tableName)
    loadTableRecords(tableName)
  }

  useEffect(() => {
    if (selectedTable) {
      loadTableRecords(selectedTable)
    }
  }, [page, selectedTable])

  const tablesColumns = [
    {
      title: '表名',
      dataIndex: 'table_name',
      key: 'table_name',
      width: 200,
    },
    {
      title: '表注释',
      dataIndex: 'table_comment',
      key: 'table_comment',
    },
    {
      title: '行数',
      dataIndex: 'table_rows',
      key: 'table_rows',
      width: 100,
    },
    {
      title: '数据长度',
      dataIndex: 'data_length',
      key: 'data_length',
      width: 120,
      render: (size: number) => {
        if (!size) return '0 B'
        const units = ['B', 'KB', 'MB', 'GB']
        let i = 0
        while (size >= 1024 && i < units.length - 1) {
          size /= 1024
          i++
        }
        return `${size.toFixed(2)} ${units[i]}`
      },
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      width: 180,
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '更新时间',
      dataIndex: 'update_time',
      key: 'update_time',
      width: 180,
      render: (time: string) => (time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '-'),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: any) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewTable(record.table_name)}
        >
          查看
        </Button>
      ),
    },
  ]

  const structureColumns = [
    {
      title: '字段名',
      dataIndex: 'column_name',
      key: 'column_name',
      width: 200,
    },
    {
      title: '字段类型',
      dataIndex: 'column_type',
      key: 'column_type',
      width: 150,
    },
    {
      title: '是否可空',
      dataIndex: 'is_nullable',
      key: 'is_nullable',
      width: 100,
    },
    {
      title: '键',
      dataIndex: 'column_key',
      key: 'column_key',
      width: 80,
    },
    {
      title: '默认值',
      dataIndex: 'column_default',
      key: 'column_default',
    },
    {
      title: '额外属性',
      dataIndex: 'extra',
      key: 'extra',
      width: 150,
    },
    {
      title: '字段注释',
      dataIndex: 'column_comment',
      key: 'column_comment',
    },
  ]

  const getDynamicColumns = () => {
    if (tableRecords.length === 0) return []
    const firstRecord = tableRecords[0]
    return Object.keys(firstRecord).map((key) => ({
      title: key,
      dataIndex: key,
      key: key,
      ellipsis: true,
      width: 150,
      render: (value: any) => {
        if (value === null || value === undefined) {
          return <span style={{ color: '#999' }}>NULL</span>
        }
        if (typeof value === 'boolean') {
          return value ? 'true' : 'false'
        }
        if (typeof value === 'object') {
          return JSON.stringify(value)
        }
        return String(value)
      },
    }))
  }

  const tabItems = [
    {
      key: 'tables',
      label: (
        <span>
          <TableOutlined /> 数据库表列表
        </span>
      ),
      children: (
        <Table
          columns={tablesColumns}
          dataSource={tables}
          rowKey="table_name"
          loading={loading}
          pagination={false}
        />
      ),
    },
  ]

  return (
    <div>
      <Title level={3} style={{ marginBottom: 24 }}>
        数据表管理
      </Title>

      <Tabs items={tabItems} />

      {selectedTable && (
        <div style={{ marginTop: 24 }}>
          <Title level={4} style={{ marginBottom: 16 }}>
            表: {selectedTable}
          </Title>

          <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
            表结构
          </Title>
          <Spin spinning={structureLoading}>
            <Table
              columns={structureColumns}
              dataSource={tableStructure}
              rowKey="column_name"
              pagination={false}
              size="small"
            />
          </Spin>

          <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
            表数据
          </Title>
          <Spin spinning={recordsLoading}>
            <Table
              columns={getDynamicColumns()}
              dataSource={tableRecords}
              rowKey={(record, index) => record?.id || index}
              pagination={{
                current: page,
                pageSize,
                total,
                showSizeChanger: false,
                onChange: setPage,
              }}
              size="small"
              scroll={{ x: 'max-content' }}
            />
          </Spin>
        </div>
      )}
    </div>
  )
}

export default DatabaseManagement
