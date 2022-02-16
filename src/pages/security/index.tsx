import { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Tabs,
  Modal,
  Form,
  message,
  Divider,
  Popconfirm,
  Tooltip,
  Input,
  Select,
} from 'antd';
import { request } from 'umi';
import moment from 'moment';
import styles from './index.less';

export default function Security() {
  const [data, setData] = useState([]);
  const [rulesData, setRulesData] = useState([]);

  const [securityInfo, setSecurityInfo] = useState({
    visible: false,
    data: {},
    type: 'add',
  });
  const [ruleInfo, setRuleInfo] = useState({
    visible: false,
    data: {},
    type: 'add',
  });
  const [associationInfo, setAssociationInfo] = useState({
    visible: false,
    data: {},
    name: '-',
    id: undefined,
  });
  const [associationRuleInfo, setAssociationRuleInfo] = useState({
    visible: false,
    data: undefined,
  });

  const [form] = Form.useForm();
  const [ruleform] = Form.useForm();
  const [associationform] = Form.useForm();

  useEffect(() => {
    getSecurityGroups(1);
    getSecurityRules(1);
  }, []);

  const getSecurityGroups = async (v: number) => {
    const res = await request('/api/v1/security-groups', {
      method: 'get',
      params: {
        page: v,
        per_page: 50,
      },
    });
    if (res) {
      setData(res);
    } else {
      setData([]);
      message.error('get security groups error');
    }
  };

  const createSecurityGroup = async (params: any) => {
    const res = await request('/api/v1/security-groups', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('create success');
      setSecurityInfo({
        data: {},
        visible: false,
        type: 'add',
      });
      getSecurityGroups(1);
    } else {
      message.error('create failed, pleace check u params');
    }
  };

  const updateSecurityGroupById = async (params: any) => {
    const res = await request(`/api/v1/security-groups/${params.id}`, {
      method: 'patch',
      data: params,
    });
    if (res) {
      message.success('update success');
      setSecurityInfo({
        data: {},
        visible: false,
        type: 'add',
      });
      getSecurityGroups(1);
    } else {
      message.error('update failed, pleace check u params');
    }
  };

  const deleteSecurityGroupById = (id: number | string) => {
    const res = request(`/api/v1/security-groups/${id}`, {
      method: 'delete',
    });
    res.then(() => {
      setSecurityInfo({
        data: {},
        visible: false,
        type: 'add',
      });
      getSecurityGroups(1);
      message.success('Delete Success');
    });
  };

  const getSecurityGroupById = async (
    id: number | string | undefined,
    type?: string,
  ) => {
    const res = await request(`/api/v1/security-groups/${id}`, {
      method: 'get',
    });
    if (res) {
      if (type === 'association') {
        setAssociationInfo({
          data: res.security_rules || {},
          visible: true,
          name: res.name || '-',
          id: res.id,
        });
      } else {
        setSecurityInfo({
          data: res,
          visible: true,
          type: 'update',
        });
      }
    } else {
      message.error('get security groups detail error');
    }
  };

  const createSecurityRule = async (params: any) => {
    const res = await request('/api/v1/security-rules', {
      method: 'post',
      data: params,
    });
    if (res) {
      message.success('create success');
      setRuleInfo({
        data: {},
        visible: false,
        type: 'add',
      });
      getSecurityRules(1);
    } else {
      message.error('create failed, pleace check u params');
    }
  };

  const getSecurityRules = async (v: number) => {
    const res = await request('/api/v1/security-rules', {
      method: 'get',
      params: {
        page: v,
        per_page: 50,
      },
    });
    if (res) {
      setRulesData(
        res.map((el: any) => {
          return {
            ...el,
            label: el.name,
            value: el.id,
          };
        }),
      );
    } else {
      setRulesData([]);
      message.error('get security rules error');
    }
  };

  const updateSecurityRuleById = async (params: any) => {
    const res = await request(`/api/v1/security-rules/${params.id}`, {
      method: 'patch',
      data: params,
    });
    if (res) {
      message.success('update success');
      setRuleInfo({
        data: {},
        visible: false,
        type: 'add',
      });
      getSecurityRules(1);
    } else {
      message.error('update failed, pleace check u params');
    }
  };

  const getSecurityRuleById = async (id: number | string) => {
    const res = await request(`/api/v1/security-rules/${id}`, {
      method: 'get',
    });
    if (res) {
      setRuleInfo({
        data: res,
        visible: true,
        type: 'update',
      });
    } else {
      message.error('get security rule detail error');
    }
  };

  const deleteSecurityRuleById = (id: number | string) => {
    const res = request(`/api/v1/security-rules/${id}`, {
      method: 'delete',
    });
    res.then(() => {
      setRuleInfo({
        data: {},
        visible: false,
        type: 'add',
      });
      getSecurityRules(1);
      message.success('Delete Success');
    });
  };

  const addSecurityRuletoSecurityGroup = (
    id: number | string | undefined,
    security_rule_id: number | string,
  ) => {
    const res = request(
      `/api/v1/security-groups/${id}/security-rules/${security_rule_id}`,
      {
        method: 'PUT',
      },
    );
    res.then(() => {
      setAssociationRuleInfo({
        data: undefined,
        visible: false,
      });
      getSecurityGroupById(id, 'association');
      message.success('Association Success');
    });
  };

  const deleteSecurityRuletoSecurityGroup = (
    id: number | string | undefined,
    security_rule_id: number | string,
  ) => {
    const res = request(
      `/api/v1/security-groups/${id}/security-rules/${security_rule_id}`,
      {
        method: 'DELETE',
      },
    );
    res.then(() => {
      setAssociationRuleInfo({
        data: undefined,
        visible: false,
      });
      getSecurityGroupById(id, 'association');
      message.success('Delete Success');
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      key: 'name',
      ellipsis: true,
      width: 80,
    },
    {
      title: 'Description',
      dataIndex: 'bio',
      align: 'left',
      key: 'bio',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Security Rules',
      dataIndex: 'security_rules',
      align: 'left',
      key: 'security_rules',
      width: 200,
      render: (v: any, i: number, r: any) => {
        return (
          <Tooltip
            title={v
              .map((subRule: any) => subRule.name || subRule.bio || '-')
              .join(',')}
          >
            <div
              style={{
                cursor: 'default',
              }}
            >
              {v
                .map((subRule: any) => subRule.name || subRule.bio || '-')
                .join(',')}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: 'Update Time',
      dataIndex: 'updated_at',
      align: 'left',
      key: 'updated_at',
      ellipsis: true,
      width: 200,
      render: (v: string) => {
        return moment(v).format('YYYY-MM-DD HH:mm:ss') || '-';
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      width: 200,
      ellipsis: true,
      fixed: 'right',
      render: (v: number | string, i: number, r: any) => {
        return (
          <div className={styles.operation}>
            <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                getSecurityGroupById(v);
              }}
            >
              Update
            </Button>
            <Divider type="vertical" />
            <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                getSecurityGroupById(v, 'association');
              }}
            >
              Association
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure to delete this Security Group?"
              onConfirm={() => {
                deleteSecurityGroupById(v);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" className={styles.newBtn}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const columns_rules = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      key: 'name',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Description',
      dataIndex: 'bio',
      align: 'left',
      key: 'bio',
      width: 120,
      ellipsis: true,
      emptyText: '',
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      align: 'left',
      key: 'domain',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Proxy Domain',
      dataIndex: 'proxy_domain',
      align: 'left',
      key: 'proxy_domain',
      width: 100,
      ellipsis: true,
    },
    {
      title: 'Update Time',
      dataIndex: 'updated_at',
      align: 'left',
      key: 'updated_at',
      ellipsis: true,
      width: 200,
      render: (v: string) => {
        return moment(v).format('YYYY-MM-DD HH:mm:ss') || '-';
      },
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      width: 140,
      ellipsis: true,
      fixed: 'right',
      render: (v: number | string, i: number, r: any) => {
        return (
          <div className={styles.operation}>
            <Button
              className={styles.newBtn}
              type="link"
              onClick={() => {
                getSecurityRuleById(v);
              }}
            >
              Update
            </Button>
            <Divider type="vertical" />
            <Popconfirm
              title="Are you sure to delete this Rule?"
              onConfirm={() => {
                deleteSecurityRuleById(v);
              }}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" className={styles.newBtn}>
                Delete
              </Button>
            </Popconfirm>
          </div>
        );
      },
    },
  ];

  const columns_association = [
    {
      title: 'ID',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      ellipsis: true,
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      align: 'left',
      key: 'name',
      ellipsis: true,
      width: 100,
    },
    {
      title: 'Domain',
      dataIndex: 'domain',
      align: 'left',
      key: 'domain',
      width: 120,
      ellipsis: true,
    },
    {
      title: 'Proxy Domain',
      dataIndex: 'proxy_domain',
      align: 'left',
      key: 'proxy_domain',
      width: 140,
      ellipsis: true,
    },
    {
      title: 'Operation',
      dataIndex: 'id',
      align: 'left',
      key: 'id',
      width: 100,
      ellipsis: true,
      fixed: 'right',
      render: (v: number | string, i: number, r: any) => {
        return (
          <Popconfirm
            title="Are you sure to delete this Rule?"
            onConfirm={() => {
              deleteSecurityRuletoSecurityGroup(associationInfo.id, v);
            }}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" className={styles.newBtn}>
              Delete
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  const handleAddAssociationRule = () => {
    setAssociationRuleInfo({
      visible: true,
      data: undefined,
    });
  };

  return (
    <div className={styles.main}>
      <h1 className={styles.title}>Security</h1>
      <Tabs
        defaultActiveKey="security_groups"
        onChange={(key: string) => {
          if (key === 'security_groups') {
            getSecurityGroups(1);
          } else {
            getSecurityRules(1);
          }
        }}
      >
        <Tabs.TabPane tab="Security Groups" key="security_groups">
          <div className={styles.content}>
            <div
              style={{
                marginBottom: 12,
              }}
            >
              <Button
                type="primary"
                onClick={() =>
                  setSecurityInfo({
                    data: {},
                    visible: true,
                    type: 'add',
                  })
                }
              >
                Create Security Group
              </Button>
            </div>
            <Table
              dataSource={data}
              pagination={{
                pageSize: 10,
                total: data.length,
                onChange: (v: number) => {},
              }}
              columns={columns}
              primaryKey="id"
            />
          </div>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Security Rules" key="security_rules">
          <div className={styles.content}>
            <div
              style={{
                marginBottom: 12,
              }}
            >
              <Button
                type="primary"
                onClick={() =>
                  setRuleInfo({
                    data: {},
                    visible: true,
                    type: 'add',
                  })
                }
              >
                Create Security Rule
              </Button>
            </div>
            <Table
              dataSource={rulesData}
              pagination={{
                pageSize: 10,
                total: rulesData.length,
                onChange: (v: number) => {},
              }}
              columns={columns_rules}
              primaryKey="id"
            />
          </div>
        </Tabs.TabPane>
      </Tabs>
      <Modal
        visible={securityInfo.visible}
        title={
          securityInfo.type === 'add'
            ? 'Create Security Group'
            : 'Update Security Group'
        }
        width={600}
        okText="Yes"
        cancelText="No"
        onCancel={() => {
          setSecurityInfo({
            data: {},
            visible: false,
            type: 'add',
          });
          form.resetFields();
        }}
        onOk={() => {
          const source = form.getFieldsValue();

          if (securityInfo.type === 'update') {
            updateSecurityGroupById({
              ...securityInfo.data,
              ...source,
            });
          } else {
            createSecurityGroup(source);
          }
        }}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={securityInfo.data || {}}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required!' }]}
          >
            <Input disabled={securityInfo.type === 'update'} />
          </Form.Item>
          <Form.Item
            name="bio"
            label="Description"
            rules={[{ required: true, message: 'Description is required!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={ruleInfo.visible}
        title={
          ruleInfo.type === 'add'
            ? 'Create Security Rule'
            : 'Update Security Rule'
        }
        width={600}
        okText="Yes"
        cancelText="No"
        onCancel={() => {
          setRuleInfo({
            data: {},
            visible: false,
            type: 'add',
          });
          ruleform.resetFields();
        }}
        onOk={() => {
          const source = ruleform.getFieldsValue();

          if (ruleInfo.type === 'update') {
            updateSecurityRuleById({
              ...ruleInfo.data,
              ...source,
            });
          } else {
            createSecurityRule(source);
          }
        }}
      >
        <Form
          layout="vertical"
          form={ruleform}
          initialValues={ruleInfo.data || {}}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Name is required!' }]}
          >
            <Input disabled={ruleInfo.type === 'update'} />
          </Form.Item>
          <Form.Item
            name="bio"
            label="Description"
            rules={[{ required: true, message: 'Description is required!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="domain"
            label="Domain"
            rules={[
              {
                required: true,
                message: 'Domain must conform to specifications.',
                type: 'url',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="proxy_domain"
            label="Proxy Domain"
            rules={[
              {
                required: true,
                message: 'Proxy Domain must conform to specifications.',
                type: 'url',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        visible={associationInfo.visible}
        title={`Security Group ${
          associationInfo?.name || '-'
        }'s Security Rules`}
        onCancel={() => {
          setAssociationInfo({
            data: {},
            visible: false,
            name: '-',
            id: undefined,
          });
          associationform.resetFields();
          getSecurityGroups(1);
        }}
        width={600}
        okText="Yes"
        cancelText="No"
        onOk={() => {
          setAssociationInfo({
            data: {},
            visible: false,
            name: '-',
            id: undefined,
          });
          associationform.resetFields();
          getSecurityGroups(1);
        }}
      >
        <Button
          onClick={handleAddAssociationRule}
          type="primary"
          style={{ marginBottom: 16 }}
        >
          Associatio a new security rule
        </Button>
        <Table
          // components={components}
          // rowClassName={() => 'editable-row'}
          // bordered
          dataSource={associationInfo.data}
          columns={columns_association}
          pagination={false}
        />
      </Modal>
      <Modal
        visible={associationRuleInfo.visible}
        title="Security Rules"
        onOk={() => {
          console.log(associationRuleInfo.data);
          if (associationRuleInfo.data) {
            addSecurityRuletoSecurityGroup(
              associationInfo.id,
              associationRuleInfo.data,
            );
          }
        }}
        onCancel={() =>
          setAssociationRuleInfo({
            visible: false,
            data: undefined,
          })
        }
        width={300}
        okText="Association"
        cancelText="No"
        style={{
          top: 200,
        }}
      >
        <Select
          options={rulesData}
          onChange={(v: number) => {
            setAssociationRuleInfo((pre: any) => {
              return {
                ...pre,
                data: v,
              };
            });
          }}
          style={{
            width: '100%',
          }}
        />
      </Modal>
    </div>
  );
}
