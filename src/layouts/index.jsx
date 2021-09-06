import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Breadcrumb,
  Divider,
  Avatar,
  Dropdown,
  Button,
} from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import { Link, request } from 'umi';
import Cookies from 'js-cookie';
import { decode } from 'jsonwebtoken';
import '../global.css';

const { SubMenu } = Menu;
const { Header, Content, Sider } = Layout;

export default function BasicLayout({
  children,
  location,
  route,
  history,
  match,
}) {
  const [key, setKey] = useState(['scheduler']);
  const [user, setUser] = useState({});

  useEffect(() => {
    const temp = location.pathname.split('/')?.[1];
    setKey(temp.length ? [temp] : ['scheduler']);
    const userInfo = decode(Cookies.get('jwt'), 'jwt') || {};
    const { id = 1 } = userInfo;
    getUserById(id);
  }, [location.pathname]);

  const getUserById = async (id) => {
    const res = await request(`/api/v1/users/${id}`, {
      method: 'get',
    });
    setUser(res);
  };

  const signout = async () => {
    const res = await request('/api/v1/users/signout', {
      method: 'post',
    });
    window.location.assign('/signin');
  };

  const menu = (
    <Menu>
      <Menu.Item
        key="0"
        style={{
          pointerEvents: 'none',
        }}
      >
        Hello, {user.name || user.id || 'Admin'}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1">
        <Button type="text" onClick={() => signout()}>
          Sign Out
        </Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        {/* <Divider
          type="vertical"
          style={{
            color: '#ffffff',
            borderColor: '#ffffff',
          }}
        /> */}
        {/* 蜻蜓-文件分发 */}
        <Dropdown overlay={menu} trigger={['click']}>
          <Avatar
            style={{
              backgroundColor: '#23B066',
              verticalAlign: 'middle',
              cursor: 'pointer',
            }}
            size="small"
            gap={4}
          >
            {user.name || user.id || 'Admin'}
          </Avatar>
        </Dropdown>
      </Header>
      <Layout>
        <Sider width={200} className="site-layout-background">
          <Menu
            mode="inline"
            defaultSelectedKeys={['scheduler']}
            defaultOpenKeys={['config']}
            selectedKeys={key}
            style={{ height: '100%', borderRight: 0 }}
            onClick={(v) => {
              // window.location.assign(`/${v.key}`);
            }}
          >
            <SubMenu
              key="config"
              icon={<SettingOutlined />}
              title="Configuration"
            >
              <Menu.Item key="scheduler">
                <Link to="/scheduler">Scheduler Cluster</Link>
              </Menu.Item>
              <Menu.Item key="cdn">
                <Link to="/cdn">CDN Cluster</Link>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Configuration</Breadcrumb.Item>
            <Breadcrumb.Item>{key[0]} Cluster</Breadcrumb.Item>
          </Breadcrumb>
          <Content
            className="site-layout-background"
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
