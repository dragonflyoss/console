import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Tabs,
  message,
  Tooltip,
  Popconfirm,
  Divider,
} from 'antd';
import { request } from 'umi';
import styles from './index.less';

const { TabPane } = Tabs;

export default function Permission() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getPermissions();
  }, []);

  const getPermissions = async () => {
    const res = await request('/api/v1/permissions', {
      method: 'get',
    });
    if (res && res.length) {
      setData(
        res.map((el: any, idx: number) => {
          // TODO add key && pagination
          return {
            ...el,
            id: idx,
          };
        }),
      );
    } else {
      setData([]);
      message.error('get permission list error');
    }
  };

  const getRoles = async () => {
    const res = await request('/api/v1/roles', {
      method: 'get',
    });
    if (res && res.length) {
      setData(
        res.map((el: any, idx: number) => {
          const source = el.split(':');
          return {
            id: idx,
            object: source[0],
            action: source[1] || '--',
          };
        }),
      );
    } else {
      setData([]);
      message.error('get role list error');
    }
  };

  const updateRole = (args: any) => {
    const res = request('/api/v1/roles', {
      method: 'post',
      params: args,
    });
    res
      .then((r) => {
        message.success('Update Success');
        getRoles();
      })
      .catch((v) => {});
  };

  const deleteRole = (arg: string) => {
    const res = request(`/api/v1/roles/${arg}`, {
      method: 'delete',
    });
    res
      .then((r) => {
        message.success('Delete Success');
        getRoles();
      })
      .catch((v) => {});
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Object',
      dataIndex: 'object',
      align: 'left',
      key: 'object',
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
      title: 'Action',
      dataIndex: 'action',
      align: 'left',
      key: 'action',
      ellipsis: true,
      render: (v: string) => {
        let res = v;
        if (v === '*') {
          res = 'all';
        }
        return (
          <Tooltip title={res}>
            <div className={styles.tableItem}>{res.toUpperCase()}</div>
          </Tooltip>
        );
      },
    },
  ];

  const columns_role = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Object',
      dataIndex: 'object',
      align: 'left',
      key: 'object',
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
      title: 'Action',
      dataIndex: 'action',
      align: 'left',
      key: 'action',
      ellipsis: true,
      render: (v: string) => {
        let res = v;
        if (v === '*') {
          res = 'all';
        }
        return (
          <Tooltip title={res}>
            <div className={styles.tableItem}>{res.toUpperCase()}</div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            <Button
              className={styles.newBtn}
              type="link"
              disabled
              onClick={() => {
                // const target = {
                //   permission: [
                //     {
                //       ...r,
                //     }
                //   ],
                //   role: r.object,
                // };
                // updateRole(target);
              }}
            >
              Update
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure to delete this Role?"
              onConfirm={() => {
                deleteRole(r.object);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" className={styles.newBtn} disabled>
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
      <h1 className={styles.title}>Permission</h1>
      <div className={styles.content}>
        <Tabs
          onChange={(v: string) => {
            if (v === 'permission') {
              getPermissions();
            } else {
              getRoles();
            }
          }}
        >
          <TabPane tab="Permissions" key="permission">
            <Table
              dataSource={data}
              pagination={{
                pageSize: 10,
                total: data.length,
              }}
              columns={columns}
              primaryKey="id"
            />
          </TabPane>
          <TabPane tab="Roles" key="role">
            <Table
              dataSource={data}
              pagination={{
                pageSize: 10,
                total: data.length,
              }}
              columns={columns_role}
              primaryKey="id"
            />
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
}
