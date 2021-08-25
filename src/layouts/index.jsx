import React, { useState, useEffect } from 'react';
import { Layout, Menu, Breadcrumb, Divider } from 'antd';
import { UnorderedListOutlined } from '@ant-design/icons';
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
  const [path, setPath] = useState([]);

  useEffect(() => {
    const temp = location.pathname.split('/')[1];
    setKey(temp.length ? [temp] : ['scheduler']);
  }, [location.pathname]);

  return (
    <Layout>
      <Header className="header">
        <div className="logo" />
        <Divider
          type="vertical"
          style={{
            color: '#ffffff',
            borderColor: '#ffffff',
          }}
        />
        蜻蜓-文件分发
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
              icon={<UnorderedListOutlined />}
              title="配置管理"
            >
              <Menu.Item key="scheduler">
                <Link to="/scheduler">Scheduler配置</Link>
              </Menu.Item>
              <Menu.Item key="cdn">
                <Link to="/cdn">CDN配置</Link>
              </Menu.Item>
            </SubMenu>
          </Menu>
        </Sider>
        <Layout style={{ padding: '0 24px 24px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>配置管理</Breadcrumb.Item>
            <Breadcrumb.Item>{key[0].toUpperCase()}配置</Breadcrumb.Item>
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
