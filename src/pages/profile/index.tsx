import { useState, useEffect } from 'react';
import { history, request } from 'umi';
import { Avatar, Button, Form, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styles from './index.less';

export default function Security() {
  const [visible, setVisible] = useState(false);

  const userInfo = history?.location?.state || {};

  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  // const updateUserById = async (params: any) => {
  //   const res = await request('/api/v1/oauth', {
  //     method: 'post',
  //     data: params,
  //   });
  //   if (res) {
  //     message.success('update success');
  //   } else {
  //     message.error('update failed, pleace check u params');
  //   }
  // };

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>My Profile</h1>
      <div className={styles.content}>
        <div className={styles.left}>
          <Avatar size={200} icon={<UserOutlined />} />
          <Button
            onClick={() => {
              setVisible(true);
              console.log(userInfo);
              if (userInfo) {
                form.setFieldsValue(userInfo);
              }
            }}
          >
            Edit Profile
          </Button>
        </div>
        {visible && (
          <div className={styles.right}>
            <Form
              name="profile"
              layout="vertical"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 8 }}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              form={form}
            >
              <Form.Item label="Bio" name="bio">
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item label="Location" name="location">
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item label="Phone" name="phone">
                <Input placeholder="Please Enter Your Infos" />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    const args = form.getFieldsValue();
                    // updateUserById()
                    console.log(args);
                  }}
                >
                  Save
                </Button>
                <Button
                  onClick={() => {
                    form.resetFields();
                    setVisible(false);
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
