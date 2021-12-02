import { useState, useEffect } from 'react';
import { Form, Input, Button, Radio, message } from 'antd';
import { request } from 'umi';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';

import styles from './index.less';

export default function Oauth() {
  const [userId, setUserId] = useState(null);
  const [oauthInfo, setOauthInfo] = useState({
    hasOauth: false,
    values: {},
  });

  const [form] = Form.useForm();

  useEffect(() => {
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    if (userInfo.id) {
      setUserId(userInfo.id);
      getOauthById(userInfo.id);
    }
  }, []);

  const onFinish = (values: any) => {
    console.log('Success:', values);
    if (oauthInfo.hasOauth) {
      updateOauthById(oauthInfo.values.id, oauthInfo.values);
    } else {
      createOauth(values);
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const createOauth = async (params: any) => {
    const res = await request('/api/v1/oauth', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('create oauth success');
      getOauthById(userId);
    } else {
      message.error('create failed, pleace check u params');
    }
  };

  const updateOauthById = async (id: number | null, params: any) => {
    const res = await request(`/api/v1/oauth/${id}`, {
      method: 'patch',
      data: params,
    });
    if (res) {
      message.success('update oauth success');
      getOauthById(userId);
    } else {
      message.error('update failed, pleace check u params');
    }
  };

  const getOauthById = async (id: number) => {
    const res = await request(`/api/v1/oauth/${id}`, {
      method: 'get',
    });

    if (!res.message) {
      setOauthInfo({
        hasOauth: true,
        values: res || {},
      });
      form.setFieldsValue(res);
    } else {
      setOauthInfo({
        hasOauth: false,
        values: {},
      });
      form.resetFields();
    }
  };

  const deleteOauthById = async (id: number) => {
    const res = await request(`/api/v1/oauth/${id}`, {
      method: 'delete',
    });

    message.success('delete Oauth success');
    form.resetFields();
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
          form={form}
        >
          <Form.Item
            label="Oauth Type"
            name="name"
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
            name="client_id"
            rules={[
              { required: true, message: 'Please input your Client ID!' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Client Secret"
            name="client_secret"
            rules={[
              { required: true, message: 'Please input your Client Secret!' },
            ]}
          >
            <Input />
          </Form.Item>
          {/* <Form.Item
            label="Application Name"
            name="application"
            rules={[
              {
                required: true,
                message: 'Please input your Application Name!',
              },
            ]}
          >
            <Input />
          </Form.Item> */}
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
            label="Redirect URL"
            name="redirect_url"
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
            <Button
              style={{
                marginLeft: 12,
              }}
              disabled={!oauthInfo.hasOauth}
              onClick={() => {
                deleteOauthById(oauthInfo.values.id);
              }}
            >
              Delete
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
