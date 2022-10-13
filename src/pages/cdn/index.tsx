import { useState, useEffect } from 'react';
import { request } from 'umi';
import {
  Input,
  Select,
  Radio,
  Button,
  Table,
  Descriptions,
  Modal,
  Form,
  Popconfirm,
  Tag,
  Tooltip,
  message,
  InputNumber,
  Pagination,
} from 'antd';
import {
  CopyOutlined,
  DeleteOutlined,
  AppstoreAddOutlined,
} from '@ant-design/icons';
import moment from 'moment';
import { parse } from 'qs';
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
const getPageMax = (link: string) => {
  const linkMap = link.split(';');
  let pageMax = 1;
  if (linkMap.length) {
    const lastRel = linkMap[linkMap.length - 2];
    let [, apiLink] = lastRel.split(',');
    apiLink = apiLink.replace('</', '').replace('>', '');
    const [, paramString] = apiLink.split('?');
    const param = parse(paramString.replace(/^\?/, ''));
    pageMax = param.page;
  }
  return pageMax;
};

// seed peer
export default function SeedPeer() {
  // seed peer clusters
  const [seedPeerClusters, setSeedPeerClusters] = useState([]);
  // cluster item status
  const [isClick, setClick] = useState(0);
  const [isHover, setHover] = useState(0);

  const [seedPeers, setSeedPeers] = useState([]);
  // cluster选择树分页
  const [current, setCurrent] = useState(1);
  const [clusterTotal, setClusterTotal] = useState(0);
  const [searchCluster, setSearchCluster] = useState('');

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

  useEffect(() => {
    getSeedPeerClusters();
  }, [current]);

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

  const getSeedPeerClusters = async () => {
    const res = await request('/api/v1/seed-peer-clusters', {
      method: 'get',
      getResponse: true, // 获取response信息
      params: {
        page: current,
        per_page: 50,
        name: searchCluster,
      },
    });
    const data = res.data || [];
    const headerLink = res.response.headers.get('Link') || '';
    const pageMax = getPageMax(headerLink);
    const total = pageMax * 50;

    if (data && typeof data === 'object' && data.length > 0) {
      data.map((sub) => {
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

      getSeedPeerByClusterId(data[0].id);
    }
    setSeedPeerClusters(data);
    setClusterTotal(total);
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
      getSeedPeerClusters();
      setFormSchema(seedPeerInfo);
    });
  };

  const deleteClusterById = (id: number) => {
    const res = request(`/api/v1/seed-peer-clusters/${id}`, {
      method: 'delete',
    });
    res.then(() => {
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
            value={searchCluster}
            onChange={(e: any) => {
              setSearchCluster(e.target.value);
            }}
            onSearch={(v) => {
              if (current === 1) {
                getSeedPeerClusters();
              } else {
                setCurrent(1);
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
          </div>
          <div className={styles.clusters}>
            {seedPeerClusters.map((sub: any, idx: number) => {
              return (
                <div
                  key={sub.name}
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
                    cursor: 'pointer',
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
                </div>
              );
            })}
            <div className={styles.pagination}>
              <Pagination
                size="small"
                current={current}
                defaultPageSize={50}
                showSizeChanger={false}
                hideOnSinglePage={true} // 只有一页时隐藏分页器
                total={clusterTotal}
                onChange={(v: number) => {
                  setCurrent(v);
                }}
              />
            </div>
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
    </div>
  );
}
