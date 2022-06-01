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
  Tooltip,
  message,
  InputNumber,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  MinusCircleOutlined,
  AppstoreAddOutlined,
  EditOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { seedPeerInfo, seedPeerOptions } from '../../../mock/data';
import CodeEditor from '@/components/codeEditor';
import styles from './index.less';

const { Search } = Input;
const comsKeys = {
  select: Select,
  json: CodeEditor,
  input: Input,
  InputNumber: InputNumber,
};

// seed peer
export default function SeedPeer() {
  // seed peer clusters
  const [seedPeerClusters, setSeedPeerClusters] = useState([]);
  // cluster item status
  const [isClick, setClick] = useState(0);
  const [isHover, setHover] = useState(0);
  // checked clusters
  const [checkKeys, setCheck] = useState([]);

  const [seedPeers, setSeedPeers] = useState([]);
  // TODO table current page
  const [current, setCurrent] = useState(1);

  // dialog title
  const [dTitle, setDTitle] = useState('');
  // form dialog content
  const [formInfo, setFormInfo] = useState<any>({});
  // form dialog schema
  const [formSchema, setFormSchema] = useState(seedPeerInfo);
  // json dialog content
  const [json, setJson] = useState('');
  // form dialog visible
  const [formVisible, setFormVisible] = useState(false);
  const [updateVisible, setUpdateVisible] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<any>({});
  // json dialog visible
  const [visible, setVisible] = useState(false);
  const [copyVisible, setCopyVisible] = useState(false);

  // drawer visible
  const [drawVisible, setDrawVisible] = useState(false);
  // drawer content
  const [drawContent, setDrawContent] = useState([
    {
      label: 'Load Limit',
      value: 'load_limit',
      type: 'InputNumber',
      key: 1,
    },
  ]);
  // drawer options
  const [drawOptions, setDrawOptions] = useState(seedPeerOptions);
  const [drawLoading, setDrawLoading] = useState(false);

  useEffect(() => {
    getSeedPeerClusters();
  }, []);

  const getSeedPeerByClusterId = async (id: string | number) => {
    const res = await request('/api/v1/seed-peers', {
      params: {
        page: 1,
        per_page: 50,
        seed_peer_cluster_id: id,
      },
    });
    if (res && typeof res === 'object') {
      setSeedPeers(
        res.map((sub) => {
          return {
            ...sub,
            key: sub.id,
          };
        }),
      );
    }
  };

  const updateSeedPeerById = (id: string, config: any) => {
    const res = request(`/api/v1/seed-peers/${id}`, {
      method: 'patch',
      data: config,
    });
    res.then(() => {
      getSeedPeerByClusterId(seedPeerClusters[isClick]?.id);
      setVisible(false);
      message.success('Update Success');
    });
  };

  const deleteSeedPeerById = (id: number) => {
    const res = request(`/api/v1/seed-peers/${id}`, {
      method: 'delete',
    });
    res.then(() => {
      message.success('Delete Success');
      getSeedPeerByClusterId(seedPeerClusters[isClick]?.id);
    });
  };

  const createSeedPeer = async (config: any) => {
    const res = await request('/api/v1/seed-peers', {
      method: 'post',
      data: config,
    });
    console.log(res);
  };

  const getSeedPeerClusters = async () => {
    const res = await request('/api/v1/seed-peer-clusters');
    if (res && typeof res === 'object' && res.length > 0) {
      res.map((sub) => {
        Object.keys(sub).map((el) => {
          if (typeof sub[el] === 'number') {
            sub[el] = sub[el].toString();
          }
          sub['created_at'] = moment(
            new Date(sub['created_at']).valueOf(),
          ).format('YYYY-MM-DD HH:MM:SS');
          sub['updated_at'] = moment(
            new Date(sub['updated_at']).valueOf(),
          ).format('YYYY-MM-DD HH:MM:SS');
        });
      });

      getSeedPeerByClusterId(res[0].id);
      setSeedPeerClusters(res);
    }
  };

  const createClusters = (config: any) => {
    const res = request('/api/v1/seed-peer-clusters', {
      method: 'post',
      data: config,
    });
    setJson('');
    res.then((r) => {
      message.success('Create Success');
      setFormVisible(false);
      setCopyVisible(false);
      setFormSchema(seedPeerInfo);
      setUpdateInfo({});
      getSeedPeerClusters();
    });
  };

  const updateClusterById = (config: any) => {
    const res = request(`/api/v1/seed-peer-clusters/${config.id}`, {
      method: 'patch',
      data: config,
    });
    res.then(() => {
      message.success('Update Success');
      setFormVisible(false);
      setDrawVisible(false);
      getSeedPeerClusters();
      setFormSchema(seedPeerInfo);
    });
  };

  const deleteClusterById = (id: number) => {
    const res = request(`/api/v1/seed-peer-clusters/${id}`, {
      method: 'delete',
    });
    res.then(() => {
      setCheck((pre) => {
        pre.splice(
          pre.findIndex((item) => item === id.toString()),
          1,
        );
        return pre;
      });
      message.success('Delete Success');
      getSeedPeerClusters();
    });
  };

  const columns = [
    {
      title: 'Hostname',
      dataIndex: 'host_name',
      align: 'left',
      key: 'host_name',
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
            >
              {v || '-'}
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: 'Net Topology',
      dataIndex: 'net_topology',
      align: 'left',
      key: 'net_topology',
      render: (v: string) => {
        return (
          <Tooltip title={v}>
            <div className={styles.tableItem}>{v || '-'}</div>
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
      title: 'IDC',
      dataIndex: 'idc',
      align: 'left',
      key: 'idc',
      render: (v: string) => {
        return (
          <Tooltip title={v}>
            <div className={styles.tableItem}>{v || '-'}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Download Port',
      dataIndex: 'download_port',
      align: 'center',
      key: 'download_port',
      render: (v: string) => {
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
        return (
          <Tag color={v === 'active' ? 'green' : 'cyan'}>{v.toUpperCase()}</Tag>
        );
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
              type="link"
              className={styles.newBtn}
              onClick={() => {
                let res = '';
                try {
                  res = JSON.stringify(r, null, 2);
                } catch (e) {
                  console.log(e);
                }
                setDTitle('Update Seed Peer');
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
                deleteSeedPeerById(t);
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
      <h1 className={styles.title}>Seed Peer Cluster</h1>
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
                const f = seedPeerClusters.filter((sub) => sub.name.includes(v));
                setSeedPeerClusters(f);
              } else {
                getSeedPeerClusters();
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
                setFormSchema(seedPeerInfo);
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
              {seedPeerClusters.map((sub: any, idx: number) => {
                return (
                  <Checkbox
                    key={sub.name}
                    value={sub.id}
                    onClick={() => {
                      setClick(idx);
                      getSeedPeerByClusterId(sub.id);
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
                        <Popconfirm
                          title="Are you sure to copy this seed peer cluster?"
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
                          title="Are you sure to delete this seed peer cluster?"
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
                );
              })}
            </Checkbox.Group>
          </div>
        </div>
        <div className={styles.right}>
          <Descriptions
            title="Cluster Info"
            column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
            extra={
              <Button
                type="primary"
                size="small"
                onClick={() => {
                  setDTitle('Update Cluster');
                  const temp: any = [];
                  seedPeerInfo.map((sub: any) => {
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

                    const source: any = seedPeerClusters[isClick] || {};

                    if (
                      sub.key === 'load_limit' ||
                      sub.key === 'net_topology'
                    ) {
                      sub = {
                        ...sub,
                        formprops: {
                          ...sub.formprops,
                          initialValue: source?.config[sub.key] || undefined,
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
            {seedPeerInfo.map((sub: any, idx: number) => {
              const source = seedPeerClusters[isClick] || {};

              if (sub.title) return null;
              return (
                <Descriptions.Item
                  label={
                    <Tooltip title={sub.en_US}>
                      <div
                        style={{
                          width: '90%',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {sub.en_US}
                      </div>
                    </Tooltip>
                  }
                  key={idx}
                  labelStyle={{
                    width: '140px',
                    alignItems: 'center',
                    flex: '0 0 140px',
                  }}
                >
                  {sub.key === 'load_limit' || sub.key === 'net_topology' ? (
                    <Tooltip title={(source?.config || {})[sub.key] || '-'}>
                      <div
                        style={{
                          width: '90%',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {(source?.config || {})[sub.key] || '-'}
                      </div>
                    </Tooltip>
                  ) : (
                    <Tooltip title={source[sub.key] || '-'}>
                      <div
                        style={{
                          width: '90%',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {source[sub.key] || '-'}
                      </div>
                    </Tooltip>
                  )}
                </Descriptions.Item>
              );
            })}
          </Descriptions>
          <div className={styles.divideLine} />
          <div className={styles.infoTitle}>Seed Peer</div>
          <Table
            dataSource={seedPeers}
            columns={columns}
            primaryKey="name"
            pagination={{
              pageSize: 10,
              total: seedPeers.length,
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
                      updateSeedPeerById(res.id, res);
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
          setFormInfo({});
          setFormSchema(seedPeerInfo);
          setFormVisible(false);
          setUpdateVisible(false);
        }}
        footer={[
          <Button
            key="back"
            onClick={() => {
              setFormInfo({});
              setFormSchema(seedPeerInfo);
              setFormVisible(false);
              setUpdateVisible(false);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              let temp_config = {};
              try {
                temp_config = JSON.parse(formInfo.config);
              } catch (e) {
                console.log('errors:', e);
              }
              if (dTitle.includes('Add')) {
                createClusters({
                  ...formInfo,
                  config: {
                    load_limit: formInfo?.load_limit || 1,
                    net_topology: formInfo?.net_topology || '',
                  },
                });
              } else {
                updateClusterById({
                  id: seedPeerClusters[isClick]?.id?.toString(),
                  ...formInfo,
                  config: {
                    load_limit: formInfo?.load_limit || 1,
                    net_topology: formInfo?.net_topology || '',
                  },
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
              label: 'Load Limit',
              value: 'load_limit',
              type: 'InputNumber',
              key: 1,
            },
          ]);
          setDrawOptions(seedPeerOptions);
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
                  label: 'Load Limit',
                  value: 'load_limit',
                  type: 'InputNumber',
                  key: 1,
                },
              ]);
              setDrawOptions(seedPeerOptions);
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
              drawContent.forEach((sub: any) => {
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
                  config: config,
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
                {(
                  (seedPeerClusters.filter((e: any) => e?.id?.toString() === subKey) ||
                    [])[0] || {}
                )?.name || ''}
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
                    setDrawContent((pre: any) => {
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
                  onChange={(v: any) => {
                    setDrawContent((pre: any) => {
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
                      }, 50);
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
              setDrawContent((pre: any) => {
                pre.push({
                  key: pre.length + 1,
                });
                return pre;
              });
              setTimeout(() => {
                setDrawLoading(false);
              }, 50);
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
