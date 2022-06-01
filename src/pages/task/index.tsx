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
  Descriptions,
} from 'antd';
import {
  ArrowLeftOutlined,
  LoadingOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  FileDoneOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { request } from 'umi';
import CodeEditor from '@/components/codeEditor';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import moment from 'moment';

import styles from './index.less';

let taskRetry = null;
const defaultArgs = {
  filters: '',
  headers: {},
};

export default function PreHeat() {
  const [data, setData] = useState([]);
  const [seedPeerClusters, setSeedPeerClusters] = useState([]);
  const [schedulerClusters, setSchedulerClusters] = useState([]);

  const [taskInfo, setTaskInfo] = useState({});
  const [userId, setUserId] = useState(null);

  const [visible, setVisible] = useState(false); // create dialog
  const [isDetail, setDetail] = useState(false); // detail page
  const [isInfo, setInfo] = useState({
    visible: false,
    value: '',
  }); // code editor

  useEffect(() => {
    getTasks(1);
    // getSeedPeerClusters();
    getSchedulerClusters();

    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    setUserId(userInfo.id);
  }, []);

  useEffect(() => {
    if (isDetail && !['SUCCESS', 'FAILURE'].includes(taskInfo.state)) {
      taskRetry = setInterval(() => {
        getTaskById(taskInfo.id);
      }, 3000);
    } else {
      clearInterval(taskRetry);
      taskRetry = null;
    }
  }, [isDetail]);

  useEffect(() => {
    if (['SUCCESS', 'FAILURE'].includes(taskInfo.state)) {
      clearInterval(taskRetry);
      taskRetry = null;
    }
  }, [taskInfo]);

  const [form] = Form.useForm();

  const getTasks = async (v: number) => {
    const res = await request('/api/v1/jobs', {
      method: 'get',
      params: {
        page: v,
        per_page: 50,
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

  const getSchedulerClusters = async () => {
    const res = await request('/api/v1/scheduler-clusters');
    if (res && typeof res === 'object' && res.length > 0) {
      setSchedulerClusters(
        res.map((sub: any) => {
          return {
            ...sub,
            label: sub.name,
            value: sub.id,
          };
        }),
      );
    }
  };

  const getSeedPeerClusters = async () => {
    const res = await request('/api/v1/seed-peer-clusters');
    if (res && typeof res === 'object' && res.length > 0) {
      setSeedPeerClusters(
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
      setVisible(false);
      getTasks(1);
    } else {
      message.error('create failed, pleace check u params');
    }
  };

  const updateTask = async (id: number, params: any) => {
    const res = await request(`/api/v1/jobs/${id}`, {
      method: 'patch',
      data: params,
    });
    if (res) {
      message.success('update success');
    } else {
      message.error('update failed, pleace check u params');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
      width: 80,
    },
    {
      title: 'Description',
      dataIndex: 'bio',
      align: 'left',
      key: 'bio',
      ellipsis: true,
      width: 120,
      render: (v: string, r: any) => {
        return (
          <Tooltip title={v}>
            <Button
              type="link"
              onClick={() => {
                getTaskById(r.id);
              }}
              className={styles.newBtn}
            >
              {v}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      align: 'left',
      key: 'type',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Created Time',
      dataIndex: 'created_at',
      align: 'left',
      key: 'created_at',
      ellipsis: true,
      width: 200,
      render: (v: string) => {
        return moment(v).format('YYYY-MM-DD HH:mm:ss') || '-';
      },
    },
    {
      title: 'Creator',
      dataIndex: 'user_id',
      align: 'left',
      key: 'user_id',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'State',
      dataIndex: 'state',
      align: 'left',
      key: 'state',
      width: 110,
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
        return (
          <Tooltip
            style={{
              cursor: 'pointer',
            }}
          >
            {v['url']}
          </Tooltip>
        );
      },
    },
  ];

  const icons = {
    FAILURE: (
      <WarningOutlined
        style={{
          fontSize: 50,
          color: '#FF5E44',
          marginRight: 12,
        }}
      />
    ),
    RECEIVED: (
      <FileDoneOutlined
        style={{
          fontSize: 50,
          color: '#108ee9',
          marginRight: 12,
        }}
      />
    ),
    STARTED: (
      <PlayCircleOutlined
        style={{
          fontSize: 50,
          color: '#108ee9',
          marginRight: 12,
        }}
      />
    ),
    RETRY: (
      <ReloadOutlined
        style={{
          fontSize: 50,
          color: '#108ee9',
          marginRight: 12,
        }}
      />
    ),
    PENDING: (
      <LoadingOutlined
        style={{
          fontSize: 50,
          color: '#108ee9',
          marginRight: 12,
        }}
      />
    ),
    SUCCESS: (
      <CheckCircleOutlined
        style={{
          fontSize: 50,
          color: '#23B066',
          marginRight: 12,
        }}
      />
    ),
  };

  const statusIcon = (key: string) => {
    return icons[key];
  };

  if (isDetail) {
    return (
      <div className={styles.main}>
        <h1 className={styles.title}>
          <ArrowLeftOutlined
            style={{
              cursor: 'pointer',
              marginRight: 8,
            }}
            onClick={() => {
              setDetail(false);
              setTaskInfo({});
              getTasks(1);
            }}
          />
          PreHeat
        </h1>
        <div className={styles.detailContent}>
          <div className={styles.detailHeader}>
            <div className={styles.detailInfo}>
              <Descriptions title="Base Info" size="small">
                <Descriptions.Item label="Task ID" span={3}>
                  {taskInfo.task_id || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={3}>
                  {taskInfo.bio || '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Created Time" span={3}>
                  {moment(taskInfo.created_at).format('YYYY-MM-DD HH:mm:ss') ||
                    '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Update Time" span={3}>
                  {moment(taskInfo.updated_at).format('YYYY-MM-DD HH:mm:ss') ||
                    '-'}
                </Descriptions.Item>
                <Descriptions.Item label="Creator" span={3}>
                  {taskInfo.user_id || '-'}
                </Descriptions.Item>
              </Descriptions>
            </div>
            <div className={styles.detailStatus}>
              <div className={styles.detailStatusName}>State</div>
              <div className={styles.detailStatusOperation}>
                {statusIcon(taskInfo.state || 'PENDING')} {taskInfo.state}
                {/* No Need */}
                {/* {taskInfo.status === 'FAILURE' || 'SUCCESS' ? (
                  <Button
                    type="primary"
                    style={{
                      marginLeft: 32,
                    }}
                    onClick={() => {
                      updateTask(taskInfo.id, {
                        status: taskInfo.status === 'FAILURE' ? 'SUCCESS' : 'FAILURE'
                      });
                    }}
                  >
                    {taskInfo.status === 'FAILURE' ? 'Open' : 'Close'}
                  </Button>
                ) : null} */}
              </div>
              {/* <div className={styles.detailStatusList}>
                {
                  Object.keys(icons).map(sub => {
                    return (
                      <div>{sub}</div>
                    );
                  })
                }
              </div> */}
            </div>
          </div>
          <Descriptions title="More Details" size="small" bordered>
            {taskInfo.args
              ? Object.keys(taskInfo.args).map((sub) => {
                  return (
                    <Descriptions.Item label={sub} span={2}>
                      {typeof taskInfo.args[sub] === 'object' ? (
                        <Button
                          type="link"
                          className={styles.newBtn}
                          onClick={() => {
                            setInfo({
                              visible: true,
                              value:
                                JSON.stringify(taskInfo.args[sub], null, 2) ||
                                '',
                            });
                          }}
                        >
                          Details
                        </Button>
                      ) : (
                        taskInfo.args[sub] || '-'
                      )}
                    </Descriptions.Item>
                  );
                })
              : null}
          </Descriptions>
        </div>
        <Modal
          visible={isInfo.visible}
          title={'Detail'}
          onCancel={() =>
            setInfo({
              visible: false,
              value: '',
            })
          }
          footer={null}
        >
          <CodeEditor
            value={isInfo.value || ''}
            height={200}
            options={{
              readOnly: true,
            }}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Task</h1>
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
            let temp = source.params || '{}';

            try {
              temp = JSON.parse(temp);
            } catch (e) {
              console.log('Parse error', e);
            }

            const params = {
              bio: source.bio || '--',
              type: source.type || 'preheat',
              scheduler_cluster_ids: source.scheduler_cluster_ids || [],
              seed_peer_cluster_ids: source.seed_peer_cluster_ids || [],
              args: {
                type: source.preheatType || 'file',
                url: source.url || '',
                filter: source.filter || '',
                headers: temp,
              },
              user_id: userId,
            };
            createTask(params);
          }}
        >
          <Form layout="vertical" form={form}>
            <Form.Item name="type" label="Type">
              <Radio value="preheat" defaultChecked={true}>
                Preheat
              </Radio>
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
            <Form.Item name="bio" label="Description">
              <Input />
            </Form.Item>
            <Form.Item
              name="url"
              label="URL"
              rules={[
                {
                  required: true,
                  message: 'URL must conform to specifications.',
                  type: 'url',
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="range"
              label="Range"
              shouldUpdate
              style={{ marginBottom: 8 }}
              rules={[{ required: true, message: 'Range is required!' }]}
            >
              <Radio.Group
                options={[
                  {
                    label: 'Scheduler Cluster',
                    value: 'scheduler_cluster',
                  },
                  {
                    label: 'Seed Peer Cluster',
                    value: 'seed_peer_cluster',
                    disabled: true,
                  },
                ]}
                defaultValue="scheduler_cluster"
              />
            </Form.Item>
            <Form.Item
              shouldUpdate={(prevValues, currentValues) =>
                prevValues.range !== currentValues.range
              }
            >
              {({ getFieldValue }) =>
                getFieldValue('range') !== 'seed_peer_cluster' ? (
                  <Form.Item
                    name="scheduler_cluster_ids"
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      mode="multiple"
                      allowClear
                      showArrow
                      options={schedulerClusters}
                      onChange={(v: any) => {
                        form.setFieldsValue({
                          scheduler_cluster_ids: v,
                        });
                      }}
                    />
                  </Form.Item>
                ) : (
                  <Form.Item name="seed_peer_cluster_ids" style={{ marginBottom: 0 }}>
                    <Select
                      mode="multiple"
                      allowClear
                      showArrow
                      options={seedPeerClusters}
                      onChange={(v: any) => {
                        console.log(v);
                        form.setFieldsValue({
                          seed_peer_cluster_ids: v,
                        });
                      }}
                    />
                  </Form.Item>
                )
              }
            </Form.Item>
            <Form.Item name="filter" label="Filter">
              <Input />
            </Form.Item>
            <Form.Item label="Headers">
              <CodeEditor
                value={
                  form.getFieldValue('params') || JSON.stringify({}, null, 2)
                }
                height={100}
                onChange={(v: any) => {
                  form.setFieldsValue('params', v);
                }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
