import { useState, useEffect } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { request } from 'umi';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';

import styles from './index.less';

export default function Oauth() {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    if (userInfo.id) {
      setUserId(userInfo.id);
      getOauth(userInfo.id);
    };
  }, []);

  const onFinish = (values: any) => {
    console.log('Success:', values);
    createOauth(userId, values);
    location.assign(`https://github.com/login/oauth/authorize?client_id=${clientID}&redirect_uri=http://localhost:8000/signin`);
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const createOauth = async (id: number | null, params: any) => {
    const res = await request(`/api/v1/oauth/${id}`, {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('create oauth success');
      getOauth(userId);
    } else {
      message.error('create failed, pleace check u params');
    }
  };

  const getOauth = async (id: number) => {
    const res = await request(`/api/v1/oauth`, {
      method: 'get',
    });
    console.log(res);
  };

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Oauth Setting</h1>
      <div className={styles.content}>
        <Form
          name="oauth"
          layout="vertical"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Oauth Type"
            name="type"
            rules={[
              { required: true, message: 'Please check your Oauth Typ!' },
            ]}
          >
            <Radio.Group name="type" defaultValue="github">
              <Radio value={'github'}>Github</Radio>
              <Radio value={'google'}>Google</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item
            label="Client ID"
            name="clientID"
            rules={[
              { required: true, message: 'Please input your Client ID!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Client Secret"
            name="clientSecret"
            rules={[
              { required: true, message: 'Please input your Client Secret!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Application Name"
            name="name"
            rules={[
              { required: true, message: 'Please input your Application Name!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Description"
            name="bio"
            rules={[
              { required: true, message: 'Please input your Description!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Redirect Url"
            name="redirect_url"
            rules={[
              { required: true, message: 'Please input your Redirect Url!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
