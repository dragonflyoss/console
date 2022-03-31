import { useState, useEffect } from 'react';
import { request } from 'umi';
import {
  Input,
  Select,
  Checkbox,
  Button,
  Table,
  Descriptions,
  Modal,
  Drawer,
  Form,
  Popconfirm,
  Tag,
  Popover,
  message,
  Tooltip,
  InputNumber,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  AppstoreAddOutlined,
  EditOutlined,
  DesktopOutlined,
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
  InputNumber: InputNumber,
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
  // TODO table current page
  const [current, setCurrent] = useState(1);

  // dialog title
  const [dTitle, setDTitle] = useState('');
  // json dialog visible
  const [visible, setVisible] = useState(false);
  // form dialog visible
  const [formVisible, setFormVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  // form dialog content
  const [formInfo, setFormInfo] = useState<any>({});
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
      value: 'cdn_cluster_id',
      type: 'select',
      key: 1,
    },
  ]);
  // drawer options
  const [drawOptions, setDrawOptions] = useState(updateOptions);
  const [drawLoading, setDrawLoading] = useState(false);

  const formOps = {
    cdn_cluster_id: cClusters,
    security_group_id: secGroups,
  };

  useEffect(() => {
    getClusters();
    getCDNClusters();
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

  const getSchedulerByClusterId = async (id: string | number, v: number) => {
    const res = await request('/api/v1/schedulers', {
      params: {
        page: v,
        per_page: 50,
        scheduler_cluster_id: id,
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

  const updateSchedulerById = (id: number, config: any) => {
    const res = request(`/api/v1/schedulers/${id}`, {
      method: 'patch',
      data: config,
    });
    res.then((e) => {
      message.success('Update Success');
      setVisible(false);
      getSchedulerByClusterId(sClusters[isClick]?.id, 1);
    });
  };

  const deleteSchedulerById = (id: string) => {
    const res = request(`/api/v1/schedulers/${id}`, {
      method: 'delete',
    });
    res.then((v) => {
      message.success('Delete Success');
      getSchedulerByClusterId(sClusters[isClick]?.id, 1);
    });
  };

  const getClusters = async () => {
    const res = await request('/api/v1/scheduler-clusters');
    if (res && typeof res === 'object' && res.length > 0) {
      // number to string
      res.map((sub: any) => {
        Object.keys(sub).forEach((el) => {
          if (typeof sub[el] === 'number') {
            sub[el] = sub[el].toString();
          }
          // let temp_cluster: any[] = [];
          // if (typeof sub['cdn_clusters'] === 'object') {
          //   (sub['cdn_clusters'] || []).forEach((cluster: any) => {
          //     temp_cluster.push(cluster.id || cluster || '');
          //   }) || [];
          // } else {
          //   temp_cluster = sub['cdn_clusters'];
          // }
          // // console.log(sub['cdn_clusters'], temp_cluster);
          // sub['cdn_clusters'] = Number(temp_cluster.toString());
          // sub['cdn_cluster_id'] = Number(temp_cluster.toString());
          sub['created_at'] = moment(
            new Date(sub['created_at']).valueOf(),
          ).format('YYYY-MM-DD HH:MM:SS');
          sub['updated_at'] = moment(
            new Date(sub['updated_at']).valueOf(),
          ).format('YYYY-MM-DD HH:MM:SS');
        });
      });

      // console.log(res);
      getSchedulerByClusterId(res[0].id, 1);
      setClusters(res);
    }
  };

  const getCDNClusters = async () => {
    const res = await request('/api/v1/cdn-clusters');
    if (res && res.length > 0) {
      setCdnClusters(
        res.map((el: any) => {
          return {
            ...el,
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
        res.map((el: any) => {
          return {
            label: el.name,
            value: el.id,
          };
        }),
      );
    }
  };

  const createClusters = (config: any) => {
    const res = request('/api/v1/scheduler-clusters', {
      method: 'post',
      data: config,
    });
    res.then((r) => {
      message.success('Create Success');
      setCopyVisible(false);
      setFormVisible(false);
      setUpdateInfo({});
      setFormSchema(info);
      setFormInfo({});
      getClusters();
    });
    setJson('');
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
          value: 'cdn_cluster_id',
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
        setCheck((pre) => {
          pre.splice(
            pre.findIndex((item) => item === id.toString()),
            1,
          );
          return pre;
        });
        message.success('Delete Success');
        getClusters();
      })
      .catch((v) => {});
  };

  const columns = [
    {
      title: 'Hostname',
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
            <Button
              type={location.origin.includes('alibaba') ? 'link' : 'text'}
              onClick={() => {
                if (location.origin.includes('alibaba')) {
                  window.open(
                    `https://sa.alibaba-inc.com/ops/terminal.html?ip=${v}`,
                  );
                }
              }}
              style={{
                overflow: 'auto',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <DesktopOutlined />
              {v || '-'}
            </Button>
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
            <div className={styles.tableItem}>{v || '-'}</div>
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
            <div className={styles.tableItem}>{v || '-'}</div>
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
            <div className={styles.tableItem}>{v || '-'}</div>
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
            <div className={styles.tableItem}>{v || '-'}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'State',
      dataIndex: 'state',
      align: 'left',
      key: 'state',
      width: 120,
      render: (v: string) => {
        return <Tag color={v === 'active' ? 'green' : 'cyan'}>{v || '-'}</Tag>;
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      width: 140,
      key: 'id',
      render: (t: number | string, r: any, i: number) => {
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
                const f = sClusters.filter((sub: any) =>
                  sub?.name?.includes(v),
                );
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
                  <Tooltip title={sub.name}>
                    <Checkbox
                      key={sub.id}
                      value={sub.id}
                      onClick={() => {
                        setClick(idx);
                        setFormSchema(info);
                        getSchedulerByClusterId(sub.id, 1);
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
                        style={{
                          background:
                            isClick === idx ? '#EBF7F1' : 'transparent',
                          color:
                            isClick === idx ? '#23B066' : 'rgba(0, 0, 0, 0.85)',
                        }}
                      >
                        {sub.name}
                      </div>
                      {isHover === sub.id ? (
                        <div className={styles.activeButton}>
                          <Popconfirm
                            title="Are you sure to Copy this Scheduler Cluster?"
                            onConfirm={() => {
                              setUpdateInfo(sub);
                              setCopyVisible(true);
                            }}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button
                              type="text"
                              className={styles.newBtn}
                              style={{
                                marginRight: 4,
                              }}
                            >
                              <CopyOutlined />
                            </Button>
                          </Popconfirm>
                          <Popconfirm
                            title="Are you sure to delete this Scheduler Cluster?"
                            onConfirm={() => {
                              deleteClusterById(sub.id);
                            }}
                            okText="Yes"
                            cancelText="No"
                          >
                            <Button type="text" className={styles.newBtn}>
                              <DeleteOutlined />
                            </Button>
                          </Popconfirm>
                        </div>
                      ) : (
                        <div />
                      )}
                    </Checkbox>
                  </Tooltip>
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
                  const temp: any = [];
                  const source = sClusters[isClick] || {};

                  info.map((sub: any) => {
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

                    if (sub.parent) {
                      sub = {
                        ...sub,
                        formprops: {
                          ...sub.formprops,
                          initialValue:
                            (source[sub.parent] || {})[sub.key] || undefined,
                        },
                      };
                    } else {
                      sub = {
                        ...sub,
                        formprops: {
                          ...sub.formprops,
                          initialValue: source[sub.key] || undefined,
                        },
                      };
                    }

                    temp.push(sub);
                  });

                  setFormInfo(source);
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
              const source = sClusters[isClick] || {};
              if (sub.title) return null;

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
                  {sub.parent ? (
                    <div>{(source[sub.parent] || {})[sub.key] || '-'}</div>
                  ) : (
                    <div>
                      {sub.key === 'cdn_cluster_id'
                        ? (source['cdn_clusters'] || [])[0]?.name || '-'
                        : (source || {})[sub.key] || '-'}
                    </div>
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
          onChange={(v: any) => {
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
              if (formInfo.security_group_id) {
                formInfo.security_group_domain = formInfo.security_group_id;
              }

              const params = {
                ...formInfo,
                scopes: {
                  idc: formInfo?.idc || '',
                  net_topology: formInfo?.net_topology || '',
                  location: formInfo?.location || '',
                },
                config: {
                  filter_parent_count: formInfo?.filter_parent_count || 3,
                },
                client_config: {
                  load_limit: formInfo?.load_limit || 50,
                  parallel_count: formInfo?.parallel_count || 4,
                },
              };

              if (dTitle.includes('Add')) {
                createClusters(params);
              } else {
                updateClusterById({
                  id: sClusters[isClick]?.id?.toString(),
                  ...params,
                });
              }
            }}
          >
            Submit
          </Button>,
        ]}
      >
        {updateVisible ? (
          <Form
            labelAlign="left"
            layout="vertical"
            onValuesChange={(cv, v) => {
              setFormInfo((pre: any) => {
                return {
                  ...v,
                  ...pre,
                  ...cv,
                };
              });
            }}
          >
            {formSchema.map((sub: any) => {
              const Content = comsKeys[sub.type || 'input'];
              if (sub.title) {
                return <h3>{sub.en_US}</h3>;
              } else if (!sub.hide && sub.tab === '1') {
                return (
                  <Form.Item
                    name={sub.key}
                    key={sub.key}
                    label={sub.en_US}
                    {...(sub.formprops || {})}
                  >
                    <Content {...sub.props} />
                  </Form.Item>
                );
              }
            })}
          </Form>
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
              value: 'cdn_cluster_id',
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
                  value: 'cdn_cluster_id',
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
                // console.log(sub);
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
                    if (el.value === 'cdn_cluster_id') {
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
                // console.log(pre);
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
