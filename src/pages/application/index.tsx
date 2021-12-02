import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  message,
  Tooltip,
  Popconfirm,
  Divider,
  Modal,
  Form,
  Input,
  Radio,
  Select,
  Tag,
  InputNumber,
} from 'antd';
import { request } from 'umi';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import moment from 'moment';

import styles from './index.less';

export default function Application() {
  const [apps, setApps] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isInfo, setInfo] = useState({
    visible: false,
    data: {},
  }); // infos
  const [schedulerClusters, setSchedulerClusters] = useState([]);
  const [cdnClusters, setCDNClusters] = useState([]);

  useEffect(() => {
    getApps(1);
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    setUserId(userInfo.id);
    getSchedulerClusters();
    getCDNClusters();
  }, []);

  const [form] = Form.useForm();

  const getApps = async (v: number) => {
    const res = await request('/api/v1/applications', {
      method: 'get',
      params: {
        page: v,
        per_page: 50,
      },
    });
    if (res) {
      setApps(res);
    } else {
      setApps([]);
      message.error('get apps error');
    }
  };

  const getAppById = async (id: number | string) => {
    const res = await request(`/api/v1/applications/${id}`, {
      method: 'get',
    });
    if (res) {
      setInfo({
        data: res,
        visible: true,
        type: 'update',
      });
    } else {
      message.error('get app detail error');
    }
  };

  const createApp = async (params: any) => {
    const res = await request('/api/v1/applications', {
      method: 'post',
      data: params,
    });
    if (res) {
      getApps(1);
      setInfo({
        visible: false,
        data: {},
      });
      message.success('Create success');
    } else {
      message.error('Create error');
    }
  };

  const deleteAppById = (id: number | string) => {
    const res = request(`/api/v1/applications/${id}`, {
      method: 'delete',
    });
    res.then(() => {
      getApps(1);
      message.success('Delete Success');
    });
  };

  const updateAppById = async (params: any) => {
    const res = await request(`/api/v1/applications/${params.id}`, {
      method: 'patch',
      data: params,
    });
    if (res) {
      getApps(1);
      setInfo({
        visible: false,
        data: {},
      });
      message.success('Update success');
    } else {
      message.error('Update error');
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

  const getCDNClusters = async () => {
    const res = await request('/api/v1/cdn-clusters');
    if (res && res.length > 0) {
      setCDNClusters(
        res.map((el) => {
          return {
            label: el.name,
            value: el.id,
          };
        }),
      );
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      key: 'name',
      ellipsis: true,
      width: 80,
      render: (v: string, r: any) => {
        return <Tooltip title={v}>{v}</Tooltip>;
      },
    },
    {
      title: 'Description',
      dataIndex: 'bio',
      align: 'left',
      key: 'bio',
      ellipsis: true,
      width: 110,
    },
    {
      title: 'Download Rate Limit',
      dataIndex: 'download_rate_limit',
      align: 'left',
      key: 'download_rate_limit',
      width: 130,
      ellipsis: true,
      render: (v: string, r: any) => {
        return v + ' times/s';
      },
    },
    {
      title: 'CDN Clusters',
      dataIndex: 'cdn_clusters',
      align: 'left',
      key: 'cdn_clusters',
      width: 114,
      ellipsis: true,
      render: (v: any, r: any) => {
        return v || '-';
      },
    },
    {
      title: 'Scheduler Clusters',
      dataIndex: 'scheduler_clusters',
      align: 'left',
      key: 'scheduler_clusters',
      width: 130,
      ellipsis: true,
      render: (v: any, r: any) => {
        return v || '-';
      },
    },
    {
      title: 'Update Time',
      dataIndex: 'updated_at',
      align: 'left',
      key: 'updated_at',
      ellipsis: true,
      width: 140,
      render: (v: string) => {
        return moment(v).format('YYYY-MM-DD HH:mm:ss') || '-';
      },
    },
    // {
    //   title: 'Creator',
    //   dataIndex: 'user_id',
    //   align: 'left',
    //   key: 'user_id',
    //   width: 100,
    //   ellipsis: true,
    // },
    {
      title: 'State',
      dataIndex: 'state',
      align: 'left',
      key: 'state',
      width: 80,
      render: (v: string) => {
        const colors = {
          enable: 'green',
        };
        return <Tag color={colors[v]}>{v}</Tag>;
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      width: 140,
      ellipsis: true,
      render: (v: number | string, i: number, r: any) => {
        return (
          <div className={styles.operation}>
            <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                getAppById(v);
              }}
            >
              Update
            </Button>
            <Divider type="vertical" />
            {/* <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                // getAppById(v);
              }}
            >
              State
            </Button>
            <Divider type="vertical" /> */}
            <Popconfirm
              title="Are you sure to delete this Scheduler?"
              onConfirm={() => {
                deleteAppById(v);
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
      <h1 className={styles.title}>Application</h1>
      <div className={styles.content}>
        <div
          style={{
            marginBottom: 12,
          }}
        >
          <Button
            type="primary"
            onClick={() =>
              setInfo({
                visible: true,
                data: {},
              })
            }
          >
            Create Application
          </Button>
        </div>
        <Table
          dataSource={apps}
          pagination={{
            pageSize: 10,
            total: apps.length,
            onChange: (v: number) => {
              getApps(v);
            },
          }}
          columns={columns}
          primaryKey="id"
        />
        <Modal
          visible={isInfo.visible}
          title="Create Application"
          width={600}
          onCancel={() => {
            form.resetFields();
            setInfo({
              visible: false,
              data: {},
            });
          }}
          onOk={() => {
            const source = form.getFieldsValue();

            const params = {
              ...isInfo.data,
              ...source,
              user_id: userId,
            };

            if (isInfo.type === 'update') {
              updateAppById(params);
            } else {
              createApp(params);
            }
          }}
        >
          <Form layout="vertical" form={form} initialValues={isInfo.data || {}}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Name is required!' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="bio"
              label="Description"
              rules={[{ required: true, message: 'Description is required!' }]}
            >
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
              name="download_rate_limit"
              label="Download Rate Limit"
              rules={[
                { required: true, message: 'Download Rate Limit is required!' },
              ]}
            >
              <InputNumber
                min={0}
                max={65535}
                defaultValue={10}
                addonAfter={'times/s'}
              />
            </Form.Item>
            <Form.Item
              name="cdn_clusters"
              style={{ marginBottom: 0 }}
              label="CDN Cluster"
            >
              <Select
                mode="multiple"
                allowClear
                showArrow
                options={cdnClusters}
                // onChange={(v: any) => {
                //   form.setFieldsValue({
                //     cdn_clusters: v,
                //   });
                // }}
              />
            </Form.Item>
            <Form.Item
              name="scheduler_clusters"
              style={{ marginBottom: 0 }}
              label="Scheduler Cluster"
            >
              <Select
                mode="multiple"
                allowClear
                showArrow
                options={schedulerClusters}
                // onChange={(v: any) => {
                //   form.setFieldsValue({
                //     scheduler_cluster_ids: v,
                //   });
                // }}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
}
