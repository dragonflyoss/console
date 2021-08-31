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
  Drawer,
  Form,
  Tabs,
} from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { info, tableData } from '../../../mock/data';
import CodeEditor from '@/components/codeEditor';
import styles from './index.less';

const { Search } = Input;
const comsKeys = {
  select: Select,
  json: CodeEditor,
  input: Input,
};

// scheduler
export default function IndexPage() {
  // scheduler clusters
  const [sClusters, setClusters] = useState([]);
  // cdn scheduler clusters
  const [cClusters, setCdnClusters] = useState([]);
  // security groups
  const [secGroups, setGroup] = useState([]);
  // cluster item status
  const [isClick, setClick] = useState(0);
  const [isHover, setHover] = useState(0);
  // checked clusters
  const [checkKeys, setCheck] = useState([]);

  const [scheduler, setSchedulers] = useState([]);
  // table current page
  const [current, setCurrent] = useState(1);

  // dialog title
  const [dTitle, setDTitle] = useState('');
  // json dialog visible
  const [visible, setVisible] = useState(false);
  // form dialog visible
  const [formVisible, setFormVisible] = useState(false);
  // form dialog content
  const [formInfo, setFormInfo] = useState({});
  // json dialog content
  const [json, setJson] = useState('');

  // drawer visible
  // const [drawVisible, setDrawVisible] = useState(false);

  const formOps = {
    cdn_cluster_id: cClusters,
    SecurityGroupID: secGroups,
  };

  useEffect(() => {
    getClusters();
    getSchedulers(current);
  }, []);

  const getSchedulers = async (v: number) => {
    const res = await request('/api/v1/schedulers', {
      params: {
        page: v,
        per_page: 10,
        SchedulerClusterID: 1, // TODO no need
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

  const getCDNClusters = async () => {
    const res = await request('/api/v1/cdn-clusters');
    if (res && res.length > 0) {
      setCdnClusters(
        res.map((el) => {
          return {
            label: el.name,
            value: el.id,
          };
        }),
      );
    }
  };

  const getSecGroups = async () => {
    const res = await request('/api/v1/security-groups');
    if (res && res.length > 0) {
      console.log(res);
      setGroup(
        res.map((el) => {
          return {
            label: el.name,
            value: el.domain,
          };
        }),
      );
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
      params: config,
    });
    console.log(res);
    if (res) {
      setFormVisible(false);
    }
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
      key: 'name',
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            <Button type="text">Update</Button>
            <Divider type="vertical" />
            <Button type="text">Delete</Button>
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
                marginRight: 8,
                fontSize: 12,
              }}
              onClick={() => {
                setFormVisible(true);
                setDTitle('Add Cluster');
              }}
            >
              <CopyOutlined />
              Add Cluster
            </Button>
            <Button
              type="text"
              className={styles.newBtn}
              style={{
                fontSize: 12,
              }}
            >
              <CopyOutlined />
              Batch Update
            </Button>
          </div>
          <div className={styles.clusters}>
            <Checkbox.Group
              style={{ width: '100%' }}
              onChange={(v: any) => {
                setCheck(v);
              }}
            >
              {sClusters.map((sub: any, idx: number) => {
                return (
                  <Checkbox
                    key={sub.id}
                    value={sub.id}
                    onClick={() => {
                      setClick(idx);
                    }}
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
                    <div
                      className={styles.checkLabel}
                      title={sub.name}
                      style={{
                        background: isClick === idx ? '#EBF7F1' : 'transparent',
                        color:
                          isClick === idx ? '#23B066' : 'rgba(0, 0, 0, 0.85)',
                      }}
                    >
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
            extra={
              <Button
                type="link"
                onClick={() => {
                  setFormVisible(true);
                }}
              >
                Update
              </Button>
            }
          >
            {info.map((sub: any, idx: number) => {
              return (
                <Descriptions.Item
                  label={sub.key}
                  key={idx}
                  labelStyle={{
                    width: '120px',
                    alignItems: 'center',
                  }}
                >
                  {sub.type === 'json' ? (
                    <Button
                      type="link"
                      className={styles.newBtn}
                      onClick={() => {
                        // 默认第一个集群选中
                        let temp = (sClusters[isClick] || {})[sub.key] || '';
                        if (typeof temp !== 'string') {
                          try {
                            temp = JSON.stringify(temp, null, 2);
                          } catch (e) {
                            console.log(e);
                          }
                        }
                        setDTitle(sub.key);
                        setJson(temp);
                        setVisible(true);
                      }}
                    >
                      View Details
                    </Button>
                  ) : (
                    <div>
                      {(sClusters[isClick] || {})[sub.key] === 0
                        ? (sClusters[isClick] || {})[sub.key]
                        : '--'}
                    </div>
                  )}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
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
          code={json}
          height={200}
          options={{
            readOnly: true,
          }}
        />
      </Modal>
      <Modal
        visible={formVisible}
        title={dTitle}
        onCancel={() => setFormVisible(false)}
        onOk={() => setFormVisible(false)}
        bodyStyle={{
          paddingLeft: 0,
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setFormInfo({});
              setFormVisible(false);
            }}
          >
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              // const temp = {
              //   "name": "test2",
              //   "bio": "test",
              //   "cdn_cluster_id": 1,
              //   "scopes": "{}",
              //   "config": "{}",
              //   "client_config": "{}",
              //   security_group_domain: "0"
              // }
              createClusters(formInfo);
            }}
          >
            Submit
          </Button>,
        ]}
      >
        <Tabs tabPosition={'left'}>
          <Tabs.TabPane tab="basic info" key="1">
            <Form
              labelAlign="left"
              layout="vertical"
              onValuesChange={(cv, v) => {
                setFormInfo((pre) => {
                  return {
                    ...pre,
                    ...cv,
                  };
                });
              }}
            >
              {info.map((sub: any) => {
                const Content = comsKeys[sub.type || 'input'];
                if (!sub.hide && sub.tab === '1') {
                  return (
                    <Form.Item
                      name={sub.key}
                      key={sub.key}
                      label={sub.key}
                      {...(sub.formprops || {})}
                    >
                      <Content
                        {...sub.props}
                        onClick={() => {
                          if (sub.key === 'cdn_cluster_id') {
                            getCDNClusters();
                          } else if (sub.key === 'SecurityGroupID') {
                            getSecGroups();
                          }
                        }}
                        options={formOps[sub.key] || {}}
                      />
                    </Form.Item>
                  );
                }
              })}
            </Form>
          </Tabs.TabPane>
          <Tabs.TabPane tab="configs" key="2">
            <Form
              labelAlign="left"
              layout="vertical"
              onValuesChange={(cv, v) => {
                setFormInfo((pre) => {
                  return {
                    ...pre,
                    ...cv,
                  };
                });
              }}
            >
              {info.map((sub: any) => {
                const Content = comsKeys[sub.type || 'input'];
                if (!sub.hide && sub.tab === '2') {
                  return (
                    <Form.Item
                      name={sub.key}
                      key={sub.key}
                      label={sub.key}
                      {...(sub.formprops || {})}
                    >
                      <Content {...(sub.props || {})} />
                    </Form.Item>
                  );
                }
              })}
            </Form>
          </Tabs.TabPane>
        </Tabs>
      </Modal>
    </div>
  );
}
