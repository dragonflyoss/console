import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Tabs,
  message,
  Tooltip,
  Popconfirm,
  Divider,
  Drawer,
  Modal,
  Form,
  Input,
  Radio,
  Select,
  Tag,
} from 'antd';
import { ArrowLeftOutlined, LoadingOutlined } from '@ant-design/icons';
import { request } from 'umi';
import styles from './index.less';

export default function PreHeat() {
  const [data, setData] = useState([]);
  const [cdnClusters, setCdnClusters] = useState([]);
  const [taskInfo, setTaskInfo] = useState({});

  const [visible, setVisible] = useState(false);
  const [isDetail, setDetail] = useState(false);

  useEffect(() => {
    getTasks(1);
    getCDNClusters();
  }, []);

  const [form] = Form.useForm();

  const getTasks = async (v: number) => {
    const res = await request('/api/v1/jobs', {
      method: 'get',
      params: {
        page: v,
        per_page: 10,
      },
    });
    if (res) {
      setData(res);
    } else {
      setData([]);
      message.error('get task list error');
    }
  };

  const getTaskById = async (v: number) => {
    const res = await request(`/api/v1/jobs/${v}`, {
      method: 'get',
    });
    if (res) {
      setTaskInfo(res);
      setDetail(true);
    } else {
      message.error('get task detail error');
    }
  };

  const getCDNClusters = async () => {
    const res = await request('/api/v1/cdn-clusters');
    if (res && typeof res === 'object' && res.length > 0) {
      setCdnClusters(
        res.map((el) => {
          return {
            ...el,
            label: el.name,
            id: el.id,
          };
        }),
      );
    }
  };

  const createTask = async (params: any) => {
    const res = await request('/api/v1/jobs', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('create success');
      getTasks(1);
    } else {
      message.success('create failed, pleace check u params');
    }
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Name',
      dataIndex: 'bio',
      align: 'left',
      key: 'bio',
      ellipsis: true,
      render: (v: string, r: any) => {
        return (
          <Tooltip title={v}>
            <Button
              type="link"
              onClick={() => {
                getTaskById(r.id);
              }}
            >
              {v}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: 'Task Type',
      dataIndex: 'type',
      align: 'left',
      key: 'type',
      ellipsis: true,
    },
    {
      title: 'Created Time',
      dataIndex: 'created_at',
      align: 'left',
      key: 'created_at',
      ellipsis: true,
    },
    {
      title: 'Creator',
      dataIndex: 'user_id',
      align: 'left',
      key: 'user_id',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'left',
      key: 'status',
      ellipsis: true,
      render: (v: string) => {
        const colors = {
          PENDING: 'green',
        };
        return <Tag color={colors[v]}>{v}</Tag>;
      },
    },
    {
      title: 'Infos',
      dataIndex: 'args',
      align: 'left',
      key: 'args',
      ellipsis: true,
      render: (v: object) => {
        return <div>{v['url']}</div>;
      },
    },
  ];

  if (isDetail) {
    return (
      <div className={styles.main}>
        <h1 className={styles.title}>
          <ArrowLeftOutlined
            onClick={() => setDetail(false)}
            style={{
              marginRight: 8,
            }}
          />
          Task Detail
        </h1>
        <div className={styles.content}>
          <div className={styles.left}>
            <LoadingOutlined
              style={{
                fontSize: 50,
                color: '#108ee9',
              }}
            />
          </div>
          <div className={styles.right}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Task List</h1>
      <div className={styles.content}>
        <div
          style={{
            marginBottom: 12,
          }}
        >
          <Button type="primary" onClick={() => setVisible(true)}>
            Create Task
          </Button>
        </div>
        <Table
          dataSource={data}
          pagination={{
            pageSize: 10,
            total: data.length,
            onChange: (v: number) => {
              getTasks(v);
            },
          }}
          columns={columns}
          primaryKey="id"
        />
        <Modal
          visible={visible}
          title="Create Task"
          width={600}
          onCancel={() => {
            form.resetFields();
            setVisible(false);
          }}
          onOk={() => {
            const source = form.getFieldsValue();
            const params = {
              bio: source.bio || '--',
              type: source.type || 'preheat',
              args: {
                type: source.preheatType || 'file',
                url: source.url || '',
                location: source.location || '',
                cdn_cluster_ids: source.cdn_cluster_ids || [],
              },
            };
            createTask(params);
          }}
        >
          <Form layout="vertical" form={form}>
            <Form.Item name="type" label="Task Type">
              <Radio value="preheat" defaultChecked={true}>
                PreHeat
              </Radio>
            </Form.Item>
            <Form.Item
              name="bio"
              label="Description"
              rules={[{ required: true, message: 'Description is required!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="preheatType"
              label="Preheat Type"
              rules={[{ required: true, message: 'Preheat Type is required!' }]}
            >
              <Radio.Group
                options={[
                  {
                    label: 'File',
                    value: 'file',
                  },
                  {
                    label: 'Image',
                    value: 'image',
                  },
                ]}
                defaultValue="file"
              />
            </Form.Item>
            <Form.Item
              name="url"
              label="URL"
              rules={[{ required: true, message: 'URL is required!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="range"
              label="Range"
              shouldUpdate
              rules={[{ required: true, message: 'Range is required!' }]}
            >
              <Radio.Group
                options={[
                  {
                    label: 'Location',
                    value: 'location',
                  },
                  {
                    label: 'CDN Cluster',
                    value: 'cdn cluster',
                  },
                ]}
                defaultValue="location"
              />
            </Form.Item>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.range !== currentValues.range
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('range') !== 'cdn cluster' ? (
                  <Form.Item name="location" label="Location">
                    <Input />
                  </Form.Item>
                ) : (
                  <Form.Item name="cdn_cluster_ids" label="CDN Clusters">
                    <Select
                      mode="multiple"
                      allowClear
                      options={cdnClusters}
                      onChange={(v: any) => {
                        console.log(v);
                        form.setFieldsValue({
                          cdn_cluster_ids: v,
                        });
                      }}
                    />
                  </Form.Item>
                )
              }
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
