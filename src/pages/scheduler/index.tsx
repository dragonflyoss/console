import { useState, useEffect } from 'react';
import { request } from 'umi';
import {
  Menu,
  Input,
  Select,
  Checkbox,
  Button,
  Table,
  Pagination,
  Descriptions,
  Divider,
  Modal,
} from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { clusters, info, tableData } from '../../../mock/data';
import CodeEditor from '@/components/codeEditor';
import styles from './index.less';

const clustersSchema = [
  {
    label: '基本信息',
    children: [
      {
        label: '集群名称',
        value: '',
        require: true,
      },
      {
        label: '描述',
        value: '',
      },
      {
        label: '地域',
        value: '',
      },
      {
        label: '关联CDN集群信息',
        value: '',
      },
    ],
  },
  {
    label: '配置信息',
    children: [
      {
        label: 'Scheduler集群配置信息',
        value: '',
        type: 'editor',
        require: true,
      },
      {
        label: '客户端配置信息',
        type: 'editor',
        value: '',
      },
    ],
  },
];
const { Search } = Input;
// scheduler
export default function IndexPage() {
  // scheduler clusters
  const [sClusters, setClusters] = useState([]);
  // cluster item status
  const [isHover, setHover] = useState(0);
  // checked clusters
  const [checkKeys, setCheck] = useState([]);

  const [scheduler, setSchedulers] = useState([]);
  // table current page
  const [current, setCurrent] = useState(1);

  // dialog title
  const [dTitle, setDTitle] = useState('');
  // dialog visible
  const [visible, setVisible] = useState(false);
  // dialog content
  const [dContent, setDContent] = useState('');

  useEffect(() => {
    getClusters();
    getSchedulers(current);
  }, []);

  const getSchedulers = async (v: number) => {
    const res = await request('/api/v1/schedulers', {
      params: {
        page: v,
        per_page: 10,
      },
    });
    if (res) {
      setSchedulers(res);
    }
  };

  const createScheduler = async (config: any) => {
    const res = await request('/api/v1/schedulers', {
      method: 'post',
      params: {
        Scheduler: config,
      },
    });
    console.log(res);
  };

  const getSchedulerById = async (id: string) => {
    const res = await request('/api/v1/schedulers', {
      params: {
        id,
      },
    });
    console.log(res);
  };

  const updateSchedulerById = async (id: string, config: any) => {
    const res = await request('/api/v1/schedulers', {
      method: 'patch',
      params: {
        id,
        Scheduler: config,
      },
    });
    console.log(res);
  };

  const deleteSchedulerById = async (id: string) => {
    const res = await request('/api/v1/schedulers', {
      method: 'delete',
      params: {
        id,
      },
    });
    console.log(res);
  };

  const getClusters = async () => {
    const res = await request('/api/v1/scheduler-clusters');
    if (res && res.length > 0) {
      setClusters(res);
    }
  };

  const getClusterById = async (id: string) => {
    const res = await request('/api/v1/scheduler-clusters', {
      params: {
        id,
      },
    });
    console.log(res);
  };

  const createClusters = async (config: any) => {
    const res = await request('/api/v1/scheduler-clusters', {
      method: 'post',
      params: {
        SchedulerCluster: config,
      },
    });
  };

  const updateClusterById = async (id: string, config: any) => {
    const res = await request('/api/v1/scheduler-clusters', {
      method: 'patch',
      params: {
        id,
        SchedulerCluster: config,
      },
    });
  };

  const deleteClusterById = async (id: number) => {
    const res = await request('/api/v1/scheduler-clusters', {
      method: 'delete',
      params: {
        id,
      },
    });
  };

  const columns = [
    {
      title: 'HostName',
      dataIndex: 'host_name',
      align: 'left',
      key: 'host_name',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      align: 'left',
      key: 'ip',
    },
    {
      title: 'VIP',
      dataIndex: 'vip',
      align: 'left',
      key: 'vip',
    },
    {
      title: 'Location',
      dataIndex: 'location',
      align: 'left',
      key: 'location',
    },
    {
      title: 'IDC',
      dataIndex: 'idc',
      align: 'left',
      key: 'idc',
    },
    {
      title: 'Port',
      dataIndex: 'port',
      align: 'left',
      key: 'port',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'left',
      key: 'status',
      render: (v: string) => {
        return <div>{v}</div>;
      },
    },
    {
      title: '操作',
      dataIndex: 'name',
      align: 'left',
      width: '20%',
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            <Button type="text">修改</Button>
            <Divider type="vertical" />
            <Button type="text">删除</Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Scheduler配置</h1>
      <div className={styles.content}>
        <div className={styles.left}>
          <Search
            placeholder={'请输入集群名称'}
            style={{
              width: 160,
              marginBottom: 12,
            }}
          />
          <div className={styles.btnGroup}>
            <Button
              className={styles.newBtn}
              type="text"
              style={{
                marginRight: 16,
                fontSize: 12,
              }}
            >
              <CopyOutlined />
              添加集群
            </Button>
            <Button
              type="text"
              className={styles.newBtn}
              style={{
                fontSize: 12,
              }}
            >
              <CopyOutlined />
              批量更新
            </Button>
          </div>
          <div className={styles.clusters}>
            <Checkbox.Group
              style={{ width: '100%' }}
              onChange={(v: any) => {
                setCheck(v);
              }}
            >
              {sClusters.map((sub: any) => {
                return (
                  <Checkbox
                    key={sub.id}
                    value={sub.id}
                    onMouseEnter={() => {
                      setHover(sub.id);
                    }}
                    onMouseLeave={() => {
                      setHover(0);
                    }}
                    style={{
                      position: 'relative',
                      width: '100%',
                      margin: 0,
                      height: 32,
                      lineHeight: '32px',
                    }}
                  >
                    <div className={styles.checkLabel} title={sub.name}>
                      {sub.name}
                    </div>
                    {isHover === sub.id ? (
                      <div className={styles.activeButton}>
                        <Button
                          type="text"
                          className={styles.newBtn}
                          style={{
                            marginRight: 4,
                          }}
                        >
                          <CopyOutlined />
                        </Button>
                        <Button type="text" className={styles.newBtn}>
                          <DeleteOutlined />
                        </Button>
                      </div>
                    ) : (
                      <div />
                    )}
                  </Checkbox>
                );
              })}
            </Checkbox.Group>
          </div>
        </div>
        <div className={styles.right}>
          <Descriptions
            title="属性信息"
            extra={<Button type="link">修改</Button>}
          >
            {info.map((sub: any, idx: number) => {
              return (
                <Descriptions.Item
                  label={sub.label}
                  key={idx}
                  labelStyle={{
                    width: '120px',
                    alignItems: 'center',
                  }}
                >
                  {sub.type === 'dialog' ? (
                    <Button
                      type="link"
                      className={styles.newBtn}
                      onClick={() => {
                        setDTitle(sub.label);
                        setDContent(sub.value);
                        setVisible(true);
                      }}
                    >
                      查看详情
                    </Button>
                  ) : (
                    <div>{sub.value}</div>
                  )}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
          {/* <div className={styles.infoTitle}>属性信息</div>
          <div className={styles.info}>
            {info.map((sub, idx) => {
              return (
                <div className={styles.subInfo} key={idx}>
                  <div className={styles.label}>{sub.label}:</div>
                  <div className={styles.value}>{sub.value}</div>
                </div>
              );
            })}
          </div> */}
          <div className={styles.divideLine} />
          <div className={styles.infoTitle}>Scheduler实例</div>
          <Table dataSource={tableData} columns={columns} primaryKey="name" />
          {/* <Pagination
            style={{
              marginTop: 12,
              float: 'right',
            }}
          /> */}
        </div>
      </div>
      <Modal
        visible={visible}
        title={dTitle}
        onCancel={() => setVisible(false)}
        onOk={() => setVisible(false)}
      >
        <CodeEditor
          code={dContent}
          height={200}
          options={{
            readOnly: true,
          }}
        />
      </Modal>
    </div>
  );
}
