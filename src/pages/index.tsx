import { useState, useEffect } from 'react';
import { request } from 'umi';
import {
  Menu,
  Input,
  Select,
  Checkbox,
  Button,
  Table,
  Pagination,
  Descriptions,
  Divider,
  Modal,
} from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import styles from './index.less';

// login
export default function IndexPage() {
  useEffect(() => {}, []);

  return (
    <div className={styles.main}>
      <div className={styles.left} />
      <div className={styles.right}>
        <div className={styles.header}>
          <div className={styles.title}>
            <div className={styles.logo} />
            蜻蜓-文件分发
          </div>
          <div className={styles.i18n}>简体中文</div>
        </div>
        <div className={styles.content}></div>
      </div>
    </div>
  );
}
