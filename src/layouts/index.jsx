import React, { useState, useEffect } from 'react';
import { Search, Nav, Shell } from '@alicloudfe/components';
import '@alicloudfe/components/dist/hybridcloud.css';
import '../global.css';

const { SubNav, Item } = Nav;

export default function Layout({ children, location, route, history, match }) {
  const [key, setKey] = useState(['scheduler']);

  useEffect(() => {
    const temp = location.pathname.split('/')[1];
    setKey(temp.length ? [temp] : ['scheduler']);
  }, [location.pathname]);

  return (
    <Shell className={'iframe-hack'}>
      <Shell.Branding>
        <div className="rectangular" />
        <div className="divide" />
        <span style={{ marginLeft: 8 }}>蜻蜓-文件分发</span>
      </Shell.Branding>
      <Shell.Navigation direction="hoz" collapse>
        <Search
          key="2"
          shape="simple"
          type="dark"
          palceholder="Search"
          style={{ width: '200px' }}
        />
      </Shell.Navigation>
      <Shell.Action>
        <img
          src="https://img.alicdn.com/tfs/TB1.ZBecq67gK0jSZFHXXa9jVXa-904-826.png"
          className="avatar"
          alt="用户头像"
        />
        {/* <span style={{ marginLeft: 10 }}>MyName</span> */}
      </Shell.Action>

      <Shell.Navigation trigger={null}>
        <Nav
          embeddable
          aria-label="global navigation"
          defaultOpenAll
          defaultSelectedKeys={['scheduler']}
          selectedKeys={key}
          onSelect={(v) => {
            setKey(v);
            window.location.assign(`/${v[0]}`);
          }}
        >
          <SubNav icon="account" label="配置管理" key="config">
            <Item icon="account" key="scheduler">
              Scheduler配置
            </Item>
            <Item icon="account" key="cdn">
              CDN配置
            </Item>
          </SubNav>
        </Nav>
      </Shell.Navigation>

      <Shell.Content>{children}</Shell.Content>
    </Shell>
  );
}
