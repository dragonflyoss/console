import { useState, useEffect } from 'react';
import { Form, Input, Button, Radio, message, Modal } from 'antd';
import { request } from 'umi';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';

import styles from './index.less';

export default function Oauth() {
  const [userId, setUserId] = useState(null);
  const [oauthInfo, setOauthInfo] = useState({
    hasOauth: false,
    values: [],
  });
  const [currentOauth, setCurrentOauth] = useState({});

  const [form] = Form.useForm();

  useEffect(() => {
    getOauth();
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    if (userInfo.id) {
      setUserId(userInfo.id);
    }
    form.setFieldsValue({
      type: 'github',
    });
  }, []);

  const onFinish = (values: any) => {
    console.log('Success:', values);
    if (oauthInfo.hasOauth) {
      updateOauthById(currentOauth.id, values);
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
      getOauth();
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
      message.success('Update oauth success');
      getOauth();
    } else {
      message.error('Update failed, pleace check u params');
    }
  };

  const getOauth = async () => {
    const res = await request('/api/v1/oauth', {
      method: 'get',
      skipErrorHandler: true,
    });

    // TODO
    if (!res.message) {
      setOauthInfo({
        hasOauth: true,
        values: res || [],
      });
      setCurrentOauth(res[0] || {});
      form.setFieldsValue(res[0] || {});
    } else {
      setOauthInfo({
        hasOauth: false,
        values: [],
      });
      setCurrentOauth({});
      form.setFieldsValue({
        type: 'github',
        client_id: '',
        client_secret: '',
        bio: '',
        redirect_url: '',
      });
    }
  };

  const deleteOauthById = (id: number) => {
    const res = request(`/api/v1/oauth/${id}`, {
      method: 'delete',
    });
    return res;
  };

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>OAuth Setting</h1>
      <div className={styles.content}>
        <Form
          name="oauth"
          layout="vertical"
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 16 }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          form={form}
        >
          <Form.Item
            label="OAuth Type"
            name="type"
            rules={[
              { required: true, message: 'Please check your OAuth Typ!' },
            ]}
          >
            <Radio.Group
              name="type"
              onChange={(e: any) => {
                const v = e?.target?.value;
                const target =
                  oauthInfo?.values.filter((el) => el.name === v) || [];
                setCurrentOauth(target[0] || {});

                if (target.length > 0) {
                  form.setFieldsValue(target[0] || {});
                } else {
                  form.setFieldsValue({
                    type: v,
                    client_id: '',
                    client_secret: '',
                    bio: '',
                    redirect_url: '',
                  });
                }
              }}
            >
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
              disabled={!currentOauth.id}
              onClick={() => {
                Modal.confirm({
                  title: 'Do you Want to delete this OAuth?',
                  onOk() {
                    deleteOauthById(currentOauth.id)
                      .then((res) => {
                        console.log(res);
                        message.success('Delete OAuth success');
                        form.setFieldsValue({
                          type: 'github',
                          client_id: '',
                          client_secret: '',
                          bio: '',
                          redirect_url: '',
                        });
                      })
                      .catch((er) => {
                        console.log('errors:', er);
                        message.success('Delete OAuth failed');
                        form.setFieldsValue({
                          type: 'github',
                          client_id: '',
                          client_secret: '',
                          bio: '',
                          redirect_url: '',
                        });
                      });
                  },
                });
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
