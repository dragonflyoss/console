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
  message,
  Tooltip,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  AppstoreAddOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { info, updateOptions } from '../../../mock/data';
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
  const [updateVisible, setUpdateVisible] = useState(false);
  // form dialog content
  const [formInfo, setFormInfo] = useState({});
  // form dialog schema
  const [formSchema, setFormSchema] = useState(info);
  // json dialog content
  const [json, setJson] = useState('');
  const [updateInfo, setUpdateInfo] = useState({});

  const [copyVisible, setCopyVisible] = useState(false);
  // drawer visible
  const [drawVisible, setDrawVisible] = useState(false);
  // drawer content
  const [drawContent, setDrawContent] = useState([
    {
      label: 'cdn_clusters',
      value: 'cdn_clusters',
      type: 'select',
      key: 1,
    },
  ]);
  // drawer options
  const [drawOptions, setDrawOptions] = useState(updateOptions);
  const [drawLoading, setDrawLoading] = useState(false);

  const formOps = {
    cdn_clusters: cClusters,
    security_group_id: secGroups,
  };

  useEffect(() => {
    getClusters();
    getSchedulers(current);
    // mock
    // createScheduler({
    //   "host_name": "test15",
    //   "idc": "2",
    //   "ip": "22.3445.112.23",
    //   "location": "22",
    //   "net_config": {
    //     "additionalProp1": {}
    //   },
    //   "port": 60,
    //   scheduler_cluster_id: 1,
    //   "vips": "2,23,45,62,1"
    // });
  }, []);

  const getSchedulers = async (v: number) => {
    const res = await request('/api/v1/schedulers', {
      params: {
        page: v,
        per_page: 50,
      },
    });
    if (res && typeof res === 'object') {
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

  const getSchedulerById = async (id: string) => {
    const res = await request('/api/v1/schedulers', {
      params: {
        id,
      },
    });
    console.log(res);
  };

  const updateSchedulerById = (id: number, config: any) => {
    const res = request(`/api/v1/schedulers/${id}`, {
      method: 'patch',
      data: config,
    });
    res.then((e) => {
      message.success('Update Success');
      setVisible(false);
      getSchedulers(current);
    });
  };

  const deleteSchedulerById = (id: string) => {
    const res = request(`/api/v1/schedulers/${id}`, {
      method: 'delete',
    });
    res.then((v) => {
      message.success('Delete Success');
      getSchedulers(current);
    });
  };

  const getClusters = async () => {
    const res = await request('/api/v1/scheduler-clusters');
    if (res && typeof res === 'object' && res.length > 0) {
      // number to string
      res.map((sub) => {
        Object.keys(sub).map((el) => {
          if (typeof sub[el] === 'number') {
            sub[el] = sub[el].toString();
          }
          sub['cdn_clusters'] = 1;
          // sub['cdn_clusters'].length
          //   ? sub['cdn_clusters'][0].id
          //   : '';
          sub['created_at'] = moment(
            new Date(sub['created_at']).valueOf(),
          ).format('YYYY-MM-DD HH:MM:SS');
          sub['updated_at'] = moment(
            new Date(sub['updated_at']).valueOf(),
          ).format('YYYY-MM-DD HH:MM:SS');
        });
      });
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

  const createClusters = (config: any) => {
    const res = request('/api/v1/scheduler-clusters', {
      method: 'post',
      data: config,
      errorHandler: (err) => {
        console.log(err);
      },
    });
    res.then((r) => {
      message.success('Create Success');
      setCopyVisible(false);
      setFormVisible(false);
      setJson('');
      setUpdateInfo({});
      setFormSchema(info);
      getClusters();
    });
  };

  const updateClusterById = (config: any) => {
    const res = request(`/api/v1/scheduler-clusters/${config.id}`, {
      method: 'patch',
      data: config,
    });
    res.then((r) => {
      message.success('Update Success');
      setFormSchema(info);
      setDrawContent([
        {
          label: 'cdn_clusters',
          value: 'cdn_clusters',
          type: 'select',
          key: 1,
        },
      ]);
      setDrawOptions(updateOptions);
      setFormVisible(false);
      setDrawVisible(false);
      getClusters();
    });
  };

  const deleteClusterById = (id: number) => {
    const res = request(`/api/v1/scheduler-clusters/${id}`, {
      method: 'delete',
    });
    res
      .then((r) => {
        console.log(r);
        message.success('Delete Success');
        getClusters();
      })
      .catch((v) => {});
  };

  const columns = [
    {
      title: 'HostName',
      dataIndex: 'host_name',
      align: 'left',
      key: 'host_name',
      ellipsis: true,
      render: (v: string) => {
        return (
          <Tooltip title={v}>
            <div className={styles.tableItem}>{v}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'IP',
      dataIndex: 'ip',
      align: 'left',
      key: 'ip',
      ellipsis: true,
      render: (v: string) => {
        return (
          <Tooltip title={v}>
            <div className={styles.tableItem}>{v}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Location',
      dataIndex: 'location',
      align: 'left',
      key: 'location',
      render: (v: string) => {
        return (
          <Tooltip title={v}>
            <div className={styles.tableItem}>{v}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'VIPS',
      dataIndex: 'vips',
      align: 'left',
      key: 'vips',
      width: 80,
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
            <div className={styles.tableItem}>{v}</div>
          </Popover>
        );
      },
    },
    {
      title: 'IDC',
      dataIndex: 'idc',
      align: 'left',
      key: 'idc',
      width: 90,
      ellipsis: true,
      render: (v: string) => {
        return (
          <Tooltip title={v}>
            <div className={styles.tableItem}>{v}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Port',
      dataIndex: 'port',
      align: 'left',
      key: 'port',
      width: 80,
      ellipsis: true,
      render: (v: number) => {
        return (
          <Tooltip title={v}>
            <div className={styles.tableItem}>{v}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      align: 'left',
      key: 'status',
      width: 120,
      render: (v: string) => {
        return <Tag color={v === 'active' ? 'green' : 'cyan'}>{v}</Tag>;
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      width: 140,
      key: 'id',
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            {/* <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                let res = '';
                try {
                  res = JSON.stringify(r, null, 2);
                } catch (e) {
                  console.log(e);
                }
                setDTitle('Update Scheduler');
                setUpdateInfo(res);
                setVisible(true);
              }}
            >
              Update
            </Button>
            <Divider type="vertical" /> */}
            <Popconfirm
              title="Are you sure to delete this Scheduler?"
              onConfirm={() => {
                deleteSchedulerById(t);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" className={styles.newBtn}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Scheduler Cluster</h1>
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
                const f = sClusters.filter((sub) => sub.name.includes(v));
                setClusters(f);
              } else {
                getClusters();
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
                setFormSchema(info);
                setFormVisible(true);
                setDTitle('Add Cluster');
                setTimeout(() => {
                  setUpdateVisible(true);
                }, 50);
              }}
            >
              <AppstoreAddOutlined />
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
              <EditOutlined />
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
                      setFormSchema(info);
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
                          onClick={() => {
                            setUpdateInfo(sub);
                            setCopyVisible(true);
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
                type="primary"
                size="small"
                onClick={() => {
                  setDTitle('Update Cluster');
                  console.log(sClusters[isClick]);
                  const temp = [];
                  info.map((sub) => {
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
                    const source = sClusters[isClick] || {};
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
                  setTimeout(() => {
                    setUpdateVisible(true);
                  }, 50);
                }}
              >
                Update
              </Button>
            }
          >
            {info.map((sub: any, idx: number) => {
              return (
                <Descriptions.Item
                  label={sub.en_US}
                  key={idx}
                  labelStyle={{
                    width: '120px',
                    alignItems: 'center',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
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
                    <div>{(sClusters[isClick] || {})[sub.key] || '--'}</div>
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
        visible={copyVisible}
        title="Copy this Cluster"
        width={300}
        onCancel={() => setCopyVisible(false)}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setCopyVisible(false);
              setJson('');
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              createClusters({
                ...updateInfo,
                name: json,
              });
            }}
          >
            Submit
          </Button>,
        ]}
      >
        name
        <Input
          placeholder="Please enter the name"
          onChange={(e) => {
            setJson(e.target.value);
          }}
          style={{
            marginTop: 8,
          }}
        />
      </Modal>
      <Modal
        visible={visible}
        title={dTitle}
        onCancel={() => setVisible(false)}
        footer={
          dTitle.includes('Update')
            ? [
                <Button
                  key="back"
                  onClick={() => {
                    setVisible(false);
                  }}
                >
                  Cancel
                </Button>,
                <Button
                  key="submit"
                  type="primary"
                  onClick={() => {
                    let res = {};
                    try {
                      res = JSON.parse(updateInfo);
                      updateSchedulerById(res.id, res);
                    } catch (e) {
                      console.log(e);
                    }
                  }}
                >
                  Submit
                </Button>,
              ]
            : null
        }
      >
        <CodeEditor
          value={dTitle.includes('Update') ? updateInfo : json}
          height={200}
          options={{
            readOnly: !dTitle.includes('Update'),
          }}
          onChange={(v) => {
            setUpdateInfo(v);
          }}
        />
      </Modal>
      <Modal
        visible={formVisible}
        title={dTitle}
        onCancel={() => {
          setFormVisible(false);
          setFormSchema(info);
          setUpdateVisible(false);
        }}
        bodyStyle={{
          paddingLeft: 0,
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setFormInfo({});
              setUpdateVisible(false);
              setFormVisible(false);
            }}
          >
            Cancel
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
                  id: sClusters[isClick].id.toString(),
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
        {updateVisible ? (
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
                        label={sub.en_US}
                        {...(sub.formprops || {})}
                      >
                        <Content
                          {...sub.props}
                          onClick={() => {
                            if (sub.key === 'cdn_clusters') {
                              getCDNClusters();
                            } else if (sub.key === 'security_group_id') {
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
                        label={sub.en_US}
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
        ) : null}
      </Modal>
      <Drawer
        title="Update Scheduler Clusters"
        placement="right"
        onClose={() => {
          setDrawVisible(false);
          setDrawContent([
            {
              label: 'cdn_clusters',
              value: 'cdn_clusters',
              type: 'select',
              key: 1,
            },
          ]);
          setDrawOptions(updateOptions);
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
                  label: 'cdn_clusters',
                  value: 'cdn_clusters',
                  type: 'select',
                  key: 1,
                },
              ]);
              setDrawOptions(updateOptions);
            }}
            style={{
              marginRight: 8,
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              const config = {};
              drawContent.forEach((sub) => {
                console.log(sub);
                let res = sub.update;
                if (typeof sub.update === 'string') {
                  try {
                    res = JSON.parse(res);
                  } catch (e) {
                    console.log(e);
                  }
                }
                config[sub.value] = res;
                if (sub.value === 'cdn_clusters') {
                  config['cdn_cluster_id'] = res;
                }
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
              <Tag
                closable={false}
                key={subKey}
                onClose={(v) => {
                  checkKeys.splice(checkKeys.indexOf(subKey), 1);
                  setCheck(checkKeys);
                }}
              >
                {sClusters.filter((e) => e.id.toString() === subKey)?.[0].name}
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
                    if (el.value === 'cdn_clusters') {
                      getCDNClusters(); // TODO when render get
                    } else if (el.value === 'security_group_id') {
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
                console.log(pre);
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
