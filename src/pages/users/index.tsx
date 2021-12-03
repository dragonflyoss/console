import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  message,
  Tooltip,
  Popconfirm,
  Divider,
  Drawer,
  Tag,
  Form,
  Modal,
  Radio,
} from 'antd';
import { request } from 'umi';
import moment from 'moment';

import styles from './index.less';

const infos = {
  id: 'User ID',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  location: 'Location',
  // role: 'Role',
  created_at: 'Create Time',
  updated_at: 'Update Time',
};

export default function Users() {
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);

  const [role, setRole] = useState('guest');
  const [userInfo, setUserInfo] = useState({});
  const [userRoleInfo, setUserRoleInfo] = useState({
    visible: false,
    roles: 'guest',
  });

  useEffect(() => {
    getUsers();
  }, []);

  const getUserById = async (id: number) => {
    const res = await request(`/api/v1/users/${id}`, {
      method: 'get',
    });
    if (res) {
      Object.keys(res).map((sub) => {
        if (['created_at', 'updated_at'].includes(sub)) {
          res[sub] = moment(res[sub]).format('YYYY-MM-DD HH:mm:ss') || '-';
        }
      });
      setUserInfo(res);
      setVisible(true);
    } else {
      message.error('get user info error');
    }
  };

  const getRoleByUser = async (id: number) => {
    const res = await request(`/api/v1/users/${id}/roles`, {
      method: 'get',
    });
    if (res) {
      setUserRoleInfo({
        visible: true,
        roles: res[0] || 'guest',
        id,
      });
      form.setFieldsValue({
        roles: res[0] || 'guest',
      });
    } else {
      message.error('Get Role Error');
    }
  };

  const getUsers = async () => {
    const res = await request('/api/v1/users', {
      method: 'get',
      params: {
        page: 1,
        per_page: 50,
      },
    });
    if (res) {
      setData(res);
    } else {
      setData([]);
      message.error('get user list error');
    }
  };

  const addRoleForUser = async (id: number | string, role: string) => {
    const res = await request(`/api/v1/users/${id}/roles/${role}`, {
      method: 'put',
    });
    message.success('Update Success');
    setUserRoleInfo({
      visible: false,
      roles: '',
    });
  };

  const deleteRoleForUser = async (id: number | string, role: string) => {
    await request(`/api/v1/users/${id}/roles/${role}`, {
      method: 'delete',
    });
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
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      key: 'name',
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
      title: 'Email',
      dataIndex: 'email',
      align: 'left',
      key: 'email',
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
      title: 'State',
      dataIndex: 'state',
      align: 'left',
      key: 'state',
      width: 110,
      render: (v: string) => {
        const colors = {
          enable: 'green',
        };
        return <Tag color={colors[v]}>{v.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      width: 160,
      render: (t: number, r: any, i: number) => {
        return (
          <div className={styles.operation}>
            <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                getUserById(t);
              }}
            >
              Detail
            </Button>
            <Divider type="vertical" />
            <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                // 更新用户权限
                getRoleByUser(t);
              }}
            >
              Update
            </Button>
            {/* <Divider type="vertical" />
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
            </Popconfirm> */}
          </div>
        );
      },
    },
  ];

  const [form] = Form.useForm();

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>User</h1>
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
              <div className={styles.value}>{(userInfo || {})[el] || '-'}</div>
            </div>
          );
        })}
      </Drawer>
      <Modal
        visible={userRoleInfo.visible}
        title="Update User"
        width={600}
        onCancel={() => {
          form.resetFields();
          setUserRoleInfo({
            visible: false,
            roles: '',
          });
        }}
        onOk={() => {
          const source = form.getFieldsValue();
          console.log(source, userRoleInfo);

          deleteRoleForUser(userRoleInfo.id, userRoleInfo.roles);
          addRoleForUser(userRoleInfo.id, source.roles);
        }}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={form.getFieldsValue() || {}}
        >
          <Form.Item
            label="Role"
            name="roles"
            rules={[{ required: true, message: 'Please Check Your Role!' }]}
          >
            <Radio.Group>
              <Radio value={'guest'}>Guest</Radio>
              <Radio value={'root'}>Root</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
