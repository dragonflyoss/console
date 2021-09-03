import { useState, useEffect } from 'react';
import { request } from 'umi';
import {
  Input,
  Select,
  Checkbox,
  Button,
  Table,
  Descriptions,
  Divider,
  Modal,
  Drawer,
  Form,
  Tabs,
  Popconfirm,
  Tag,
  Popover,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  UserDeleteOutlined,
} from '@ant-design/icons';
import { cdnInfo, cdnOptions } from '../../../mock/data';
import CodeEditor from '@/components/codeEditor';
import styles from './index.less';

const { Search } = Input;
const comsKeys = {
  select: Select,
  json: CodeEditor,
  input: Input,
};

// cdn
export default function CDN() {
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
  // form dialog content
  const [formInfo, setFormInfo] = useState({});
  // form dialog schema
  const [formSchema, setFormSchema] = useState(cdnInfo);
  // json dialog content
  const [json, setJson] = useState('');
  // form dialog visible
  const [formVisible, setFormVisible] = useState(false);
  // json dialog visible
  const [visible, setVisible] = useState(false);

  // drawer visible
  const [drawVisible, setDrawVisible] = useState(false);
  // drawer content
  const [drawContent, setDrawContent] = useState([
    {
      label: 'security_group_id',
      value: 'security_group_id',
      type: 'select',
      key: 1,
    },
  ]);
  // drawer options
  const [drawOptions, setDrawOptions] = useState(cdnOptions);
  const [drawLoading, setDrawLoading] = useState(false);

  const formOps = {
    security_group_id: secGroups,
  };

  useEffect(() => {
    getCDNClusters();
    getSchedulers();
  }, []);

  const getSchedulers = async () => {
    const res = await request('/api/v1/schedulers', {
      params: {
        page: 1,
        per_page: 50,
      },
    });
    if (res) {
      setSchedulers(
        res.map((sub) => {
          return {
            ...sub,
            key: sub.id,
          };
        }),
      );
    }
  };

  const createScheduler = async (config: any) => {
    const res = await request('/api/v1/schedulers', {
      method: 'post',
      data: config,
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

  const deleteSchedulerById = async (id: number) => {
    const res = await request(`/api/v1/schedulers/${id}`, {
      method: 'delete',
    });
    getSchedulers(current);
  };

  const getCDNClusters = async () => {
    const res = await request('/api/v1/cdn-clusters');
    if (res && res.length > 0) {
      res.map((sub) => {
        Object.keys(sub).map((el) => {
          if (typeof sub[el] === 'number') {
            sub[el] = sub[el].toString();
          }
        });
      });
      setCdnClusters(res);
    }
  };

  const getSecGroups = async () => {
    const res = await request('/api/v1/security-groups');
    if (res && res.length > 0) {
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

  const createClusters = async (config: any) => {
    const res = await request('/api/v1/cdn-clusters', {
      method: 'post',
      data: config,
    });
    if (res) {
      setFormVisible(false);
      getCDNClusters();
      setFormSchema(cdnInfo);
    }
  };

  const updateClusterById = async (config: any) => {
    const res = await request('/api/v1/cdn-clusters', {
      method: 'patch',
      data: config,
    });
    if (res) {
      setFormVisible(false);
      getCDNClusters();
      setFormSchema(cdnInfo);
    }
  };

  const deleteClusterById = async (id: number) => {
    const res = await request('/api/v1/cdn-clusters', {
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
      ellipsis: true,
      width: 140,
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      align: 'left',
      key: 'ip',
      ellipsis: true,
      width: 140,
    },
    {
      title: 'Location',
      dataIndex: 'location',
      align: 'left',
      key: 'location',
      ellipsis: true,
    },
    {
      title: 'VIPS',
      dataIndex: 'vips',
      align: 'left',
      key: 'vips',
      width: 70,
      ellipsis: true,
      render: (v: string) => {
        const res = v.split(',');
        const content = (
          <div>
            {res.map((el) => {
              return <p key={el}>{el}</p>;
            })}
          </div>
        );
        return (
          <Popover content={content} title="VIPS">
            <div
              style={{
                cursor: 'pointer',
              }}
            >
              {v}
            </div>
          </Popover>
        );
      },
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
        return <Tag color={v === 'active' ? 'green' : 'cyan'}>{v}</Tag>;
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      width: '20%',
      key: 'id',
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            <Button
              type="link"
              onClick={() => {
                let res = '';
                try {
                  res = JSON.stringify(r.net_config, null, 2);
                } catch (e) {
                  console.log(e);
                }
                setDTitle('Update Scheduler');
                setJson(res);
                setVisible(true);
              }}
            >
              Update
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure to delete this Scheduler?"
              onConfirm={() => {
                deleteSchedulerById(t);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link">Delete</Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>CDN Cluster</h1>
      <div className={styles.content}>
        <div className={styles.left}>
          <Search
            placeholder={'Please Enter Name'}
            style={{
              width: 180,
              marginBottom: 12,
            }}
            onSearch={(v) => {
              if (v.length > 0) {
                const f = cClusters.filter((sub) => sub.name.includes(v));
                setCdnClusters(f);
              } else {
                getCDNClusters();
              }
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
                setFormSchema(cdnInfo);
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
              onClick={() => {
                setDrawVisible(true);
              }}
              disabled={!checkKeys.length}
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
              {cClusters.map((sub: any, idx: number) => {
                return (
                  <Checkbox
                    key={sub.name}
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
                        <Button
                          type="text"
                          className={styles.newBtn}
                          onClick={() => {
                            deleteClusterById(sub.id);
                          }}
                        >
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
            title="Cluster Info"
            extra={
              <Button
                type="link"
                onClick={() => {
                  setDTitle('Update Cluster');
                  console.log(isClick);
                  const temp = [];
                  cdnInfo.map((sub) => {
                    if (sub.key === 'id' || sub.key === 'name') {
                      sub = {
                        ...sub,
                        hide: false,
                        props: {
                          ...sub.props,
                          disabled: true,
                        },
                      };
                    }
                    const source = cClusters[isClick] || {};
                    let res = '';
                    if (typeof source[sub.key] === 'object') {
                      try {
                        if (source[sub.key]) {
                          res = JSON.stringify(source[sub.key], null, 2);
                        }
                      } catch (e) {
                        console.log(e);
                      }
                    } else {
                      res = source[sub.key];
                    }
                    sub = {
                      ...sub,
                      formprops: {
                        ...sub.formprops,
                        initialValue: res,
                      },
                    };
                    temp.push(sub);
                  });
                  setFormSchema(temp);
                  setFormVisible(true);
                }}
              >
                Update
              </Button>
            }
          >
            {cdnInfo.map((sub: any, idx: number) => {
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
                        let temp = (cClusters[isClick] || {})[sub.key] || '';
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
                    <div>{(cClusters[isClick] || {})[sub.key] || '--'}</div>
                  )}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
          <div className={styles.divideLine} />
          <div className={styles.infoTitle}>Scheduler</div>
          <Table
            dataSource={scheduler}
            columns={columns}
            primaryKey="name"
            pagination={{
              pageSize: 10,
              total: scheduler.length,
            }}
          />
        </div>
      </div>
      <Modal
        visible={visible}
        title={dTitle}
        onCancel={() => setVisible(false)}
        onOk={() => setVisible(false)}
      >
        <CodeEditor
          value={json}
          height={200}
          options={{
            readOnly: !dTitle.includes('Update'),
          }}
        />
      </Modal>
      <Modal
        visible={formVisible}
        title={dTitle}
        onCancel={() => {
          setFormInfo({});
          setFormSchema(cdnInfo);
          setFormVisible(false);
        }}
        bodyStyle={{
          paddingLeft: 0,
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setFormInfo({});
              setFormSchema(cdnInfo);
              setFormVisible(false);
            }}
          >
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              let temp_scope = {};
              let temp_config = {};
              let temp_client = {};
              try {
                if (formInfo.scopes) {
                  temp_scope = JSON.parse(formInfo.scopes);
                } else if (formInfo.config) {
                  temp_config = JSON.parse(formInfo.config);
                } else if (formInfo.client_config) {
                  temp_client = JSON.parse(formInfo.client_config);
                }
              } catch (e) {
                console.log('errors:', e);
              }
              if (formInfo.security_group_id) {
                formInfo.security_group_domain = formInfo.security_group_id;
              }
              if (dTitle.includes('Add')) {
                createClusters({
                  ...formInfo,
                  scopes: temp_scope,
                  config: temp_config,
                  client_config: temp_client,
                });
              } else {
                updateClusterById({
                  id: cClusters[isClick].id.toString(),
                  ...formInfo,
                  scopes: temp_scope,
                  config: temp_config,
                  client_config: temp_client,
                });
              }
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
              {formSchema.map((sub: any) => {
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
                          if (sub.key === 'security_group_id') {
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
              {formSchema.map((sub: any) => {
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
      <Drawer
        title="Update Scheduler Clusters"
        placement="right"
        onClose={() => {
          setDrawVisible(false);
          setDrawContent([
            {
              label: 'security_group_id',
              value: 'security_group_id',
              type: 'select',
              key: 1,
            },
          ]);
          setDrawOptions(cdnOptions);
        }}
        visible={drawVisible}
        width="600"
        footer={[
          <Button
            key="back"
            onClick={() => {
              setDrawVisible(false);
              setDrawContent([
                {
                  label: 'security_group_id',
                  value: 'security_group_id',
                  type: 'select',
                  key: 1,
                },
              ]);
              setDrawOptions(cdnOptions);
            }}
            style={{
              marginRight: 8,
            }}
          >
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              const config = {};
              drawContent.forEach((sub) => {
                let res = sub.update;
                if (typeof sub.update === 'string') {
                  try {
                    res = JSON.parse(res);
                  } catch (e) {
                    console.log(e);
                  }
                }
                config[sub.value] = res;
              });
              checkKeys.forEach((id) => {
                updateClusterById({
                  id,
                  ...config,
                });
              });
            }}
          >
            Submit
          </Button>,
        ]}
      >
        <div className={styles.drawerLabel}>Selected Clusters</div>
        <div
          style={{
            marginBottom: 16,
          }}
        >
          {checkKeys.map((subKey) => {
            return (
              <Tag closable key={subKey} onClose={(v) => console.log(v)}>
                {cClusters.filter((e) => e.id.toString() === subKey)[0].name}
              </Tag>
            );
          })}
        </div>
        <div className={styles.drawerLabel}>Update Items</div>
        {!drawLoading &&
          drawContent.map((el: any, idx: number) => {
            const Content = comsKeys[el.type] || Input;
            return (
              <div className={styles.drawerContainer} key={el.key}>
                <Select
                  options={drawOptions}
                  placeholder={'Please Enter Update Item'}
                  style={{
                    width: 200,
                    marginRight: 8,
                  }}
                  onChange={(v, o) => {
                    setDrawLoading(true);
                    setDrawContent((pre) => {
                      pre[idx] = {
                        ...pre[idx],
                        ...o,
                      };
                      return pre;
                    });
                    setTimeout(() => {
                      setDrawLoading(false);
                    }, 100);
                  }}
                  value={el.value || null}
                />
                <Content
                  {...el.props}
                  placeholder={'Please Enter Update Value'}
                  style={{
                    width: 300,
                  }}
                  options={formOps[el.value] || {}}
                  onClick={() => {
                    if (el.value === 'security_group_id') {
                      getSecGroups();
                    }
                  }}
                  onChange={(v) => {
                    setDrawContent((pre) => {
                      pre[idx] = {
                        ...pre[idx],
                        update: v,
                      };
                      return pre;
                    });
                  }}
                  value={el.update}
                  width={300}
                />
                {drawContent.length > 1 && idx !== 0 && (
                  <MinusCircleOutlined
                    onClick={() => {
                      setDrawLoading(true);
                      setDrawContent((pre) => {
                        pre.splice(idx, 1);
                        return pre;
                      });
                      setTimeout(() => {
                        setDrawLoading(false);
                      }, 100);
                    }}
                    style={{
                      marginLeft: 8,
                    }}
                  />
                )}
              </div>
            );
          })}
        {drawContent.length < 6 && (
          <Button
            type="link"
            className={styles.newBtn}
            onClick={() => {
              setDrawLoading(true);
              setDrawContent((pre) => {
                pre.push({
                  key: pre.length + 1,
                });
                return pre;
              });
              setTimeout(() => {
                setDrawLoading(false);
              }, 100);
            }}
          >
            <CopyOutlined />
            Add Item
          </Button>
        )}
      </Drawer>
    </div>
  );
}
