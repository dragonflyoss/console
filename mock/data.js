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
    en_US: 'ID',
  },
  {
    key: 'name',
    label: '集群名称',
    tab: '1',
    noNeed: true,
    formprops: {
      required: true,
    },
    props: {
      placeholder: 'Please enter cluster name',
    },
    en_US: 'Name',
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
    en_US: 'Description',
  },
  {
    key: 'cdn_cluster_id',
    label: '关联CDN集群',
    type: 'select',
    tab: '1',
    props: {
      placeholder: 'Please enter CDN cluster ID',
    },
    en_US: 'CDN Cluster',
  },
  {
    key: 'security_group_id',
    label: 'security_group_id',
    type: 'select',
    tab: '1',
    props: {
      placeholder: 'Please enter SecurityGroupID',
    },
    en_US: 'Security Group ID',
  },
  {
    key: 'config',
    label: '配置信息',
    type: 'json',
    title: true,
    tab: '2',
    formprops: {
      tooltip: 'scheduler cluster config info',
      required: true,
    },
    en_US: 'Config',
  },
  {
    key: 'idc',
    label: 'IDC',
    tab: '1',
    parent: 'scopes',
    props: {
      placeholder: 'Please enter IDC, separated by "|" characters',
    },
    en_US: 'IDC',
  },
  {
    key: 'net_topology',
    label: 'Net Topology',
    tab: '1',
    parent: 'scopes',
    props: {
      placeholder: 'Please enter Net Topology, separated by "|" characters',
    },
    en_US: 'Net Topology',
  },
  {
    key: 'location',
    label: 'Location',
    tab: '1',
    parent: 'scopes',
    props: {
      placeholder: 'Please enter Location, separated by "|" characters',
    },
    en_US: 'Location',
  },
  {
    key: 'filter_parent_count',
    label: 'Filter Parent Count',
    tab: '1',
    type: 'InputNumber',
    parent: 'config',
    formprops: {
      required: true,
      initialValue: 3,
    },
    props: {
      placeholder: 'Please enter Filter Parent Count, 1-100',
      min: 1,
      max: 100,
      style: {
        width: '100%',
      },
    },
    en_US: 'Filter Parent Count',
  },
  {
    key: 'client_config',
    label: '客户端配置信息',
    type: 'json',
    title: true,
    tab: '2',
    formprops: {
      required: true,
      initialValue: JSON.stringify(
        {
          load_limit: 100,
        },
        null,
        2,
      ),
    },
    en_US: 'Client Config',
  },
  {
    key: 'load_limit',
    label: 'Load Limit',
    tab: '1',
    type: 'InputNumber',
    parent: 'client_config',
    formprops: {
      required: true,
      initialValue: 50,
    },
    props: {
      placeholder: 'Please enter Load Limit, 1 - 2000',
      min: 1,
      max: 2000,
      style: {
        width: '100%',
      },
    },
    en_US: 'Load Limit',
  },
  {
    key: 'parallel_count',
    label: 'Download Parallel Count',
    tab: '1',
    type: 'InputNumber',
    parent: 'client_config',
    formprops: {
      required: true,
      initialValue: 4,
    },
    props: {
      placeholder: 'Please enter Download Parallel Count, 1 - 50',
      min: 1,
      max: 50,
      style: {
        width: '100%',
      },
    },
    en_US: 'Download Parallel Count',
  },
  {
    key: 'created_at',
    label: '创建时间',
    hide: true,
    en_US: 'Create Time',
  },
  {
    key: 'updated_at',
    label: '更新时间',
    hide: true,
    en_US: 'Update Time',
  },
];

export const updateOptions = [
  {
    label: 'CDN Clusters',
    value: 'cdn_clusters',
    type: 'select',
  },
  {
    label: 'Security Group ID',
    value: 'security_group_id',
    type: 'select',
  },
  {
    label: 'Scope',
    value: 'scopes',
    type: 'json',
  },
  {
    label: 'Config',
    value: 'config',
    type: 'json',
  },
  {
    label: 'Client Config',
    value: 'client_config',
    type: 'json',
  },
];

export const cdnOptions = [
  {
    label: 'Load Limit',
    value: 'load_limit',
    type: 'InputNumber',
  },
  {
    label: 'Net Topology',
    value: 'net_topology',
  },
];

export const cdnInfo = [
  {
    key: 'id',
    label: '集群ID',
    hide: true, // when create should hide
    tab: '1',
    en_US: 'ID',
  },
  {
    key: 'name',
    label: '集群名称',
    tab: '1',
    noNeed: true,
    formprops: {
      required: true,
    },
    props: {
      placeholder: 'Please enter cluster name',
    },
    en_US: 'Name',
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
    en_US: 'Description',
  },
  {
    key: 'config',
    label: '配置信息',
    title: true,
    type: 'json',
    tab: '1',
    en_US: 'Config',
  },
  {
    key: 'load_limit',
    label: '负载限制',
    tab: '1',
    type: 'InputNumber',
    formprops: {
      required: true,
      initialValue: 300,
    },
    props: {
      placeholder: 'Please enter Load Limit, 1 - 5000',
      min: 1,
      max: 5000,
      style: {
        width: '100%',
      },
    },
    en_US: 'Load Limit',
  },
  {
    key: 'net_topology',
    label: '',
    tab: '1',
    props: {
      placeholder: 'Please enter Net Topology, separated by "|" characters',
    },
    en_US: 'Net Topology',
  },
  {
    key: 'created_at',
    label: '创建时间',
    hide: true,
    en_US: 'Create Time',
  },
  {
    key: 'updated_at',
    label: '更新时间',
    hide: true,
    en_US: 'Update Time',
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
          required: true,
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
