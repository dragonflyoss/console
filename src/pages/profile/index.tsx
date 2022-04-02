import { useState, useEffect } from 'react';
import { history, request, useParams } from 'umi';
import { Avatar, Button, Form, Input, message, Descriptions } from 'antd';
import { UserOutlined, MailOutlined, EnvironmentOutlined, PhoneOutlined } from '@ant-design/icons';
import styles from './index.less';

export default function Profile() {
  const [visible, setVisible] = useState(false);
  const [resetVisible, setResetVisible] = useState(false);
  const { id } : { id: string } = useParams();

  useEffect(() => {
    getUserById(id);
  }, []);

  const [form] = Form.useForm();
  const [resetForm] = Form.useForm();

  const onFinish = (values: any) => {
    updateUserById(id, values)
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const getUserById = async (id: string) => {
    const res = await request(`/api/v1/users/${id}`, {
      method: 'get',
    });
    if (res) {
      form.setFieldsValue(res || {});
    } else {
      message.error('get user info error');
    }
  };

  const updateUserById = async (id: string, params: any) => {
    const res = await request(`/api/v1/users/${id}`, {
      method: 'PATCH',
      data: params,
    });
    if (res) {
      message.success('update success');
      getUserById(id);
    } else {
      message.error('update failed, pleace check u params');
    }
  };

  const updatePasswordById = async (id: string, params: any) => {
    request(`/api/v1/users/${id}/reset_password`, {
      method: 'POST',
      data: params,
    }).then((res: any) => {
      console.log(res);
    })
    message.success('update success');
    await request('/api/v1/users/signout', {
      method: 'post',
    });
    window.location.assign('/signin');
  };


  return (
    <div className={styles.main}>
      <h1 className={styles.title}>My Profile</h1>
      <div className={styles.content}>
        <div className={styles.left}>
          <Avatar size={280} icon={<UserOutlined />} />
          <h2>{form.getFieldValue('name') || '-'}</h2>

          {!visible && !resetVisible && (
            <div>
              <Button
                onClick={() => {
                  setVisible(true);
                }}
              >
                Edit Profile
              </Button>
              <Button
                style={{
                  marginLeft: 8,
                }}
                type="primary"
                onClick={() => setResetVisible(true)}
              >
                Change Password
              </Button>
            </div>
          )}

          {visible ? (
            <Form
              name="profile"
              labelCol={{ span: 7 }}
              // wrapperCol={{ span: 8 }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              form={form}
              style={{
                marginTop: 12,
              }}
            >
              <Form.Item label="Bio" name="bio">
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item label="Location" name="location">
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item style={{ textAlign: 'center' }}>
                <Button type="primary" htmlType="submit">
                  Save
                </Button>
                <Button
                  onClick={() => {
                    setVisible(false);
                    getUserById(id);
                  }}
                  style={{
                    marginLeft: 20,
                  }}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          ) : (
            <Descriptions
              // bordered
              column={{ xxl: 2, xl: 1, lg: 1, md: 1, sm: 1, xs: 1 }}
              style={{
                marginTop: 12,
              }}
              labelStyle={{
                alignItems: 'center',
              }}
            >
              <Descriptions.Item label="Bio">
                {form.getFieldValue('bio') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<MailOutlined />}>
                {form.getFieldValue('email') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<EnvironmentOutlined />}>
                {form.getFieldValue('location') || '-'}
              </Descriptions.Item>
              <Descriptions.Item label={<PhoneOutlined />}>
                {form.getFieldValue('phone') || '-'}
              </Descriptions.Item>
            </Descriptions>
          )}
        </div>
        {resetVisible && (
          <div className={styles.right}>
            <Form
              name="password"
              layout="vertical"
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              form={resetForm}
            >
              <Form.Item
                label="Old password"
                name="old_password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                ]}
              >
                <Input.Password placeholder="Please Enter Your Old password" />
              </Form.Item>
              <Form.Item
                label="New password"
                name="new_password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  {
                    type: 'string',
                    min: 8,
                    message: 'password at least 8 characters',
                  },
                ]}
              >
                <Input.Password placeholder="Please Enter Your New password" />
              </Form.Item>
              <Form.Item
                label="Confirm new password"
                name="confirm_password"
                rules={[
                  { required: true, message: 'Please input your password!' },
                  {
                    type: 'string',
                    min: 8,
                    message: 'password at least 8 characters',
                  },
                  {
                    validator: (rule: any, value: any, callback) => {
                      if (value !== resetForm.getFieldValue('new_password')) {
                        callback('new password must be the same');
                      }
                    },
                  },
                ]}
              >
                <Input.Password placeholder="Please Confirm new password" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    const source = resetForm.getFieldsValue();
                    updatePasswordById(id, source);
                  }}
                >
                  Update password
                </Button>
                <Button
                  onClick={() => {
                    resetForm.resetFields();
                    setResetVisible(false);
                  }}
                  style={{
                    marginLeft: 20,
                  }}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </div>
        )}
      </div>
    </div>
  );
}
