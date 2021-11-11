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
} from 'antd';
import { request } from 'umi';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import styles from './index.less';

const infos = {
  id: 'User Id',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  role: 'Role',
  created_at: 'Create Time',
  updated_at: 'Update Time',
};

export default function Users() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [role, setRole] = useState('guest');

  useEffect(() => {
    // getUsers();
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    if (userInfo.id) {
      getUserById(userInfo.id);
      getRoleByUser(userInfo.id);
    }
  }, []);

  const getUserById = async (id: number) => {
    const res = await request(`/api/v1/users/${id}`, {
      method: 'get',
    });
    setData([res]);
  };

  const getRoleByUser = async (id) => {
    const res = await request(`/api/v1/users/${id}/roles`, {
      method: 'get',
    });
    setRole(res[0] || 'guest');
  };

  // const getUsers = async () => {
  //   // TODO get users
  //   const res = await request('/api/v1/permissions', {
  //     method: 'get'
  //   });
  //   if (res) {
  //     console.log(res);
  //   } else {
  //     setData([]);
  //     message.error('get user list error');
  //   }
  // };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      key: 'name',
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
      title: 'Email',
      dataIndex: 'email',
      align: 'left',
      key: 'email',
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
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      width: 300,
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                setVisible(true);
              }}
            >
              Detail
            </Button>
            <Divider type="vertical" />
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
              title="Are you sure to delete this user?"
              onConfirm={() => {
                // deleteRole(r.object);
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
      <h1 className={styles.title}>Users</h1>
      <div className={styles.content}>
        <Table
          dataSource={data}
          pagination={{
            pageSize: 10,
            total: data.length,
          }}
          columns={columns}
          primaryKey="id"
        />
      </div>
      <Drawer
        title="User Detail"
        placement="right"
        onClose={() => setVisible(false)}
        visible={visible}
        width={400}
      >
        {Object.keys(infos).map((el) => {
          return (
            <div className={styles.drawerInfo}>
              <div className={styles.label}>{infos[el]}</div>
              <div className={styles.value}>{(data[0] || {})[el] || role}</div>
            </div>
          );
        })}
      </Drawer>
    </div>
  );
}
