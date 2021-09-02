export const clusters = [
  {
    label: '集群A',
    value: 'clusterA',
  },
  {
    label: '集群B',
    value: 'clusterB',
  },
  {
    label: '集群C',
    value: 'clusterC',
  },
  {
    label: '集群D',
    value: 'clusterD',
  },
];

export const info = [
  {
    key: 'id',
    label: '集群ID',
    hide: true, // when create should hide
    tab: '1',
  },
  {
    key: 'name',
    label: '集群名称',
    tab: '1',
    formprops: {
      required: true,
    },
    props: {
      placeholder: 'Please enter cluster name',
    },
  },
  {
    key: 'bio',
    label: '描述',
    tab: '1',
    formprops: {
      tooltip: 'description',
    },
    props: {
      placeholder: 'Please enter cluster description',
    },
  },
  {
    key: 'cdn_cluster_id',
    label: '关联CDN集群',
    type: 'select',
    tab: '1',
    props: {
      placeholder: 'Please enter cdn cluster id',
    },
  },
  {
    key: 'security_group_id',
    label: 'security_group_id',
    type: 'select',
    tab: '1',
    props: {
      placeholder: 'Please enter SecurityGroupID',
    },
  },
  {
    key: 'scopes',
    label: '作用域',
    type: 'json',
    tab: '1',
  },
  {
    key: 'config',
    label: '配置信息',
    type: 'json',
    tab: '2',
    formprops: {
      tooltip: 'scheduler cluster config info',
      required: true,
    },
  },
  {
    key: 'client_config',
    label: '客户端配置信息',
    type: 'json',
    tab: '2',
    formprops: {
      required: true,
    },
  },
  {
    key: 'created_at',
    label: '创建时间',
    hide: true,
  },
  {
    key: 'updated_at',
    label: '更新时间',
    hide: true,
  },
];

export const tableData = [
  {
    key: 1,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'active',
  },
  {
    key: 2,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'inactive',
  },
  {
    key: 3,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'active',
  },
  {
    key: 4,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'inactive',
  },
  {
    key: 5,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    location: 'North',
    vip: '190.32.112',
    idc: 2314,
    port: 80,
    status: 'active',
  },
  {
    key: 6,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'active',
  },
  {
    key: 7,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'inactive',
  },
  {
    key: 8,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    location: 'North',
    vip: '190.32.112',
    idc: 2314,
    port: 80,
    status: 'active',
  },
  {
    key: 9,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'active',
  },
  {
    key: 10,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    vip: '190.32.112',
    location: 'North',
    idc: 2314,
    port: 80,
    status: 'inactive',
  },
  {
    key: 11,
    id: 1,
    host_name: '主机1',
    ip: '22.33.223',
    location: 'North',
    vip: '190.32.112',
    idc: 2314,
    port: 80,
    status: 'active',
  },
];

export const updateOptions = [
  {
    label: 'cdn_cluster_id',
    value: 'cdn_cluster_id',
    type: 'select',
  },
  {
    label: 'security_group_id',
    value: 'security_group_id',
    type: 'select',
  },
  {
    label: 'scopes',
    value: 'scopes',
    type: 'json',
  },
  {
    label: 'config',
    value: 'config',
    type: 'json',
  },
  {
    label: 'client_config',
    value: 'client_config',
    type: 'json',
  },
];

export const cdnOptions = [
  {
    label: 'security_group_id',
    value: 'security_group_id',
    type: 'select',
  },
  {
    label: 'config',
    value: 'config',
    type: 'json',
  },
];

export const cdnInfo = [
  {
    key: 'id',
    label: '集群ID',
    hide: true, // when create should hide
    tab: '1',
  },
  {
    key: 'name',
    label: '集群名称',
    tab: '1',
    formprops: {
      required: true,
    },
    props: {
      placeholder: 'Please enter cluster name',
    },
  },
  {
    key: 'bio',
    label: '描述',
    tab: '1',
    formprops: {
      tooltip: 'description',
    },
    props: {
      placeholder: 'Please enter cluster description',
    },
  },
  {
    key: 'security_group_id',
    label: 'security_group_id',
    type: 'select',
    tab: '1',
    props: {
      placeholder: 'Please enter SecurityGroupID',
    },
  },
  {
    key: 'config',
    label: '配置信息',
    type: 'json',
    tab: '2',
    formprops: {
      tooltip: 'scheduler cluster config info',
      required: true,
    },
  },
  {
    key: 'created_at',
    label: '创建时间',
    hide: true,
  },
  {
    key: 'updated_at',
    label: '更新时间',
    hide: true,
  },
];

export const loginSchema = [
  {
    label: 'Account',
    name: 'name',
  },
  {
    label: 'Password',
    name: 'password',
  },
];

export const signSchema = [
  {
    label: 'Account',
    name: 'name',
    formprops: {
      rules: [
        {
          required: true,
          message: 'Please enter your account name!',
        },
        ({ getFieldValue }) => ({
          validator(_, value) {
            const test = /^[0-9a-zA-Z]*$/;
            if (test.test(getFieldValue('name'))) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error('English letters and numbers only!'),
            );
          },
        }),
      ],
    },
  },
  {
    label: 'Email',
    name: 'email',
    formprops: {
      rules: [
        {
          type: 'email',
          message: 'The input is not valid E-mail!',
        },
        {
          message: 'Please input your E-mail!',
        },
      ],
    },
  },
  {
    label: 'Password',
    name: 'password',
    formprops: {
      hasFeedback: true,
      rules: [
        {
          required: true,
          message: 'Please input your password!',
        },
      ],
    },
  },
  {
    label: 'Confirm Password',
    name: 'passwordT',
    formprops: {
      required: true,
      dependencies: ['password'],
      hasFeedback: true,
      rules: [
        {
          required: true,
          message: 'Please confirm your password!',
        },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('password') === value) {
              return Promise.resolve();
            }
            return Promise.reject(
              new Error('The two passwords that you entered do not match!'),
            );
          },
        }),
      ],
    },
  },
];
