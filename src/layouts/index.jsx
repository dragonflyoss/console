import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Divider, Avatar, Dropdown } from 'antd';
import { ControlOutlined } from '@ant-design/icons';
import { Link } from 'umi';
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
    const temp = location.pathname.split('/')[1];
    setKey(temp.length ? [temp] : ['scheduler']);
  }, [location.pathname]);

  const menu = (
    <Menu>
      <Menu.Item
        key="0"
        style={{
          pointerEvents: 'none',
        }}
      >
        Hello, admin
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="1">
        <a href="/signout">Sign Out</a>
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
            {'admin'}
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
              icon={<ControlOutlined />}
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
