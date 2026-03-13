import { Autocomplete, Box, Button, Grid, TextField, Tooltip, Typography } from '@mui/material';
import { forwardRef, memo, Ref, useEffect, useImperativeHandle, useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import styles from './new.module.css';
import AddIcon from '@mui/icons-material/Add';

interface BlacklistItem {
  type: string;
  config: string;
  subConfig: string;
  applications: string[];
  urls: string[];
  tags: string[];
  priorities: string[];
}

interface Props {
  clusterInfo?: {
    seed_peer_cluster_config: Record<string, any>;
    peer_cluster_config: Record<string, any>;
    [x: string]: any;
  };
}

// URL 正则校验
const URL_PATTERN =
  /^(https?:\/\/)?(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d{1,5})?(?:\/[^\s]*)?$/;

const isValidURL = (value: string): boolean => {
  return URL_PATTERN.test(value);
};

const priorityOptions = [
  { value: '1', label: 'Level 1' },
  { value: '2', label: 'Level 2' },
  { value: '3', label: 'Level 3' },
  { value: '4', label: 'Level 4' },
  { value: '5', label: 'Level 5' },
];

const BlacklistConfig = ({ clusterInfo }: Props, ref: Ref<unknown> | undefined) => {
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);

  // 获取重复的组合信息
  const getDuplicateInfo = () => {
    const combinations = new Map<string, number[]>();

    blacklist.forEach((item, index) => {
      if (item.type && item.config && item.subConfig) {
        const key = `${item.type}-${item.config}-${item.subConfig}`;
        if (!combinations.has(key)) {
          combinations.set(key, []);
        }
        combinations.get(key)!.push(index);
      }
    });

    const duplicates = new Map<number, string>();
    combinations.forEach((indices, key) => {
      if (indices.length > 1) {
        indices.forEach((index) => {
          duplicates.set(index, 'Duplicate combination: ' + key.replace(/-/g, ' + '));
        });
      }
    });

    return duplicates;
  };

  const blacklistTypeOptions = ['Client', 'Seed Client'];

  // 检查是否所有可能的组合都已被使用
  const isAllCombinationsUsed = () => {
    const taskTypeOptions = [
      { value: 'task', label: 'Task' },
      { value: 'persistent_cache_task', label: 'Persistent Cache Task' },
      { value: 'persistent_task', label: 'Persistent Task' },
    ];

    // 遍历所有可能的组合
    for (const type of blacklistTypeOptions) {
      for (const taskType of taskTypeOptions) {
        const subConfigs = taskType.value === 'task' ? ['download'] : ['download', 'upload'];

        for (const subConfig of subConfigs) {
          // 如果存在一个未被使用的组合，则返回 false
          if (!isCombinationExists(type, taskType.value, subConfig)) {
            return false;
          }
        }
      }
    }

    // 所有组合都已被使用
    return true;
  };

  // 检查type+config+subconfig组合是否已存在
  const isCombinationExists = (type: string, config: string, subConfig: string, excludeIndex?: number) => {
    return blacklist.some((item, index) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return false;
      }
      return item.type === type && item.config === config && item.subConfig === subConfig;
    });
  };

  // Task Type 选项配置
  const taskTypeOptions = [
    { value: 'task', label: 'Task' },
    { value: 'persistent_cache_task', label: 'Persistent Cache Task' },
    { value: 'persistent_task', label: 'Persistent Task' },
  ];

  // 获取配置选项
  const getConfigOptions = (type: string, excludeIndex?: number) => {
    if (!type) return [];

    // 过滤掉会导致重复的 config 选项
    return taskTypeOptions.filter((option) => {
      const possibleSubConfigs = getSubConfigOptions(type, option.value, excludeIndex);
      return possibleSubConfigs.length > 0; // 只要有一个可用的 subConfig 就显示
    });
  };

  // 获取子配置选项
  const getSubConfigOptions = (type: string, config: string, excludeIndex?: number) => {
    if (!type || !config) return [];

    let options = config === 'task' ? ['download'] : ['download', 'upload'];

    // 过滤掉已存在的组合
    return options.filter((subConfig) => !isCombinationExists(type, config, subConfig, excludeIndex));
  };

  // 获取所有 Type 选项（不再过滤已存在的类型）
  const getAvailableTypes = () => {
    return blacklistTypeOptions;
  };

  const handleAddBlacklist = () => {
    // 始终添加空条目，让用户手动选择
    setBlacklist([
      ...blacklist,
      { type: '', config: '', subConfig: '', applications: [], urls: [], tags: [], priorities: [] },
    ]);
  };

  const handleRemoveBlacklist = (index: number) => {
    const newBlacklist = [...blacklist];
    newBlacklist.splice(index, 1);
    setBlacklist(newBlacklist);
  };

  const handleUpdateBlacklist = (index: number, field: string, value: any) => {
    const newBlacklist = [...blacklist];
    const currentItem = newBlacklist[index];

    // 构建新的值
    let newType = currentItem.type;
    let newConfig = currentItem.config;
    let newSubConfig = currentItem.subConfig;

    if (field === 'type') {
      newType = value;
      newConfig = '';
      newSubConfig = '';
    } else if (field === 'config') {
      newConfig = value;
      newSubConfig = '';
      if (value === 'task') {
        newSubConfig = 'download';
      }
    } else if (field === 'subConfig') {
      newSubConfig = value;

      // 当设置 subConfig 时，检查完整的组合是否重复
      if (newType && newConfig && newSubConfig) {
        if (isCombinationExists(newType, newConfig, newSubConfig, index)) {
          // 如果会导致重复，则不更新
          return;
        }
      }
    }

    // 对于 config 字段，也要检查是否会创建重复组合
    if (field === 'config' && newType && newConfig && newSubConfig) {
      if (isCombinationExists(newType, newConfig, newSubConfig, index)) {
        // 如果会导致重复，则不更新
        return;
      }
    }

    // 应用更新
    if (field === 'type') {
      newBlacklist[index] = {
        ...newBlacklist[index],
        type: newType,
        config: newConfig,
        subConfig: newSubConfig,
        // 保留用户已填写的数据，不清空
      };
    } else if (field === 'config') {
      newBlacklist[index] = {
        ...newBlacklist[index],
        config: newConfig,
        subConfig: newSubConfig,
        // 保留用户已填写的数据，不清空
      };
    } else if (field === 'subConfig') {
      newBlacklist[index] = {
        ...newBlacklist[index],
        subConfig: newSubConfig,
        // 保留用户已填写的数据，不清空
      };
    } else {
      newBlacklist[index] = { ...newBlacklist[index], [field]: value };
    }

    setBlacklist(newBlacklist);
  };

  // 处理blacklist数据转换
  const processBlacklist = (blacklist: BlacklistItem[]) => {
    const peerBlockList: any = {};
    const seedPeerBlockList: any = {};

    blacklist.forEach((item) => {
      if (!item.type || !item.config || !item.subConfig) {
        return;
      }

      // 检查是否有任何选项有值
      const hasAnyOption =
        item.applications.length > 0 || item.urls.length > 0 || item.tags.length > 0 || item.priorities.length > 0;

      if (!hasAnyOption) {
        return;
      }

      const targetBlockList = item.type === 'Client' ? peerBlockList : seedPeerBlockList;
      const configKey = item.config;

      if (!targetBlockList[configKey]) {
        targetBlockList[configKey] = {};
      }

      if (!targetBlockList[configKey][item.subConfig]) {
        targetBlockList[configKey][item.subConfig] = {};
      }

      if (item.applications.length > 0) {
        targetBlockList[configKey][item.subConfig]['applications'] = item.applications;
      }
      if (item.urls.length > 0) {
        targetBlockList[configKey][item.subConfig]['urls'] = item.urls;
      }
      if (item.tags.length > 0) {
        targetBlockList[configKey][item.subConfig]['tags'] = item.tags;
      }
      if (item.priorities.length > 0) {
        // 将 priorities 从字符串数组转换为整数数组
        targetBlockList[configKey][item.subConfig]['priorities'] = item.priorities.map((p) => parseInt(p, 10));
      }
    });

    return { peerBlockList, seedPeerBlockList };
  };

  // 逆向转换：将 API 返回的 block_list 数据转换回原始格式
  const reverseBlacklistFromData = (
    peerClusterConfig: { block_list?: any },
    seedPeerClusterConfig: { block_list?: any },
  ): BlacklistItem[] => {
    const result: BlacklistItem[] = [];

    // 处理 peer_cluster_config.block_list (Client 类型)
    const peerBlockList = peerClusterConfig?.block_list;
    if (peerBlockList && typeof peerBlockList === 'object') {
      Object.keys(peerBlockList).forEach((config) => {
        const configData = peerBlockList[config];
        if (configData && typeof configData === 'object') {
          Object.keys(configData).forEach((subConfig) => {
            const subConfigData = configData[subConfig];
            if (subConfigData && typeof subConfigData === 'object') {
              const item: BlacklistItem = {
                type: 'Client',
                config,
                subConfig,
                applications: Array.isArray(subConfigData['applications']) ? subConfigData['applications'] : [],
                urls: Array.isArray(subConfigData['urls']) ? subConfigData['urls'] : [],
                tags: Array.isArray(subConfigData['tags']) ? subConfigData['tags'] : [],
                priorities: Array.isArray(subConfigData['priorities'])
                  ? subConfigData['priorities'].map((p: number) => String(p))
                  : [],
              };

              if (
                item.applications.length > 0 ||
                item.urls.length > 0 ||
                item.tags.length > 0 ||
                item.priorities.length > 0
              ) {
                result.push(item);
              }
            }
          });
        }
      });
    }

    // 处理 seed_peer_cluster_config.block_list (Seed Client 类型)
    const seedPeerBlockList = seedPeerClusterConfig?.block_list;
    if (seedPeerBlockList && typeof seedPeerBlockList === 'object') {
      Object.keys(seedPeerBlockList).forEach((config) => {
        const configData = seedPeerBlockList[config];
        if (configData && typeof configData === 'object') {
          Object.keys(configData).forEach((subConfig) => {
            const subConfigData = configData[subConfig];
            if (subConfigData && typeof subConfigData === 'object') {
              const item: BlacklistItem = {
                type: 'Seed Client',
                config,
                subConfig,
                applications: Array.isArray(subConfigData['applications']) ? subConfigData['applications'] : [],
                urls: Array.isArray(subConfigData['urls']) ? subConfigData['urls'] : [],
                tags: Array.isArray(subConfigData['tags']) ? subConfigData['tags'] : [],
                priorities: Array.isArray(subConfigData['priorities'])
                  ? subConfigData['priorities'].map((p: number) => String(p))
                  : [],
              };

              if (
                item.applications.length > 0 ||
                item.urls.length > 0 ||
                item.tags.length > 0 ||
                item.priorities.length > 0
              ) {
                result.push(item);
              }
            }
          });
        }
      });
    }

    return result;
  };

  useImperativeHandle(ref, () => ({
    getBlacklist: () => processBlacklist(blacklist),
    setBlacklist: (peerClusterConfig: { block_list?: any }, seedPeerClusterConfig: { block_list?: any }) => {
      const reversed = reverseBlacklistFromData(peerClusterConfig, seedPeerClusterConfig);
      setBlacklist(reversed);
    },
  }));

  useEffect(() => {
    const { seed_peer_cluster_config, peer_cluster_config } = clusterInfo || {};
    const bl = reverseBlacklistFromData(
      { block_list: peer_cluster_config?.block_list },
      { block_list: seed_peer_cluster_config?.block_list },
    );
    setBlacklist(bl);
  }, [clusterInfo]);

  return (
    <>
      <Box className={styles.titleContainer}>
        <Typography variant="h6" className={styles.titleText}>
          Blocklist
        </Typography>
        <Tooltip
          title="Blacklist configuration for P2P downloads. Blocks specified applications, URLs, tags or task priorities to restrict download sources."
          placement="top"
        >
          <HelpIcon className={styles.descriptionIcon} />
        </Tooltip>
      </Box>

      {/* ADD BLACKLIST 按钮 - 移到列表上方 */}
      <Box sx={{ mt: 1, mb: 1.5 }}>
        <Button
          id="create-cluster"
          size="small"
          variant="outlined"
          disabled={isAllCombinationsUsed()}
          sx={{
            borderColor: 'var(--palette-button-color)',
            color: 'var(--palette-button-color)',
            ':hover': {
              borderColor: 'var(--palette-hover-button-text-color)',
              backgroundColor: 'var(--palette-action-hover)',
            },
          }}
          onClick={handleAddBlacklist}
        >
          <AddIcon fontSize="small" sx={{ mr: '0.4rem' }} />
          <div style={{ paddingTop: '0.25rem' }}>Add blacklist</div>
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {blacklist.length > 0 &&
          blacklist.map((item, index) => {
            const duplicateInfo = getDuplicateInfo();
            const duplicateError = duplicateInfo.get(index);
            const isSubConfigDownload = item.subConfig === 'download';

            return (
              <Box
                key={`${index}-${item.type}`}
                data-testid="blacklist-item"
                sx={{
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 1,
                  p: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                }}
              >
                {/* 第一行: Type | Config | Sub Config */}
                <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Autocomplete
                    size="small"
                    options={getAvailableTypes()}
                    value={item.type}
                    onChange={(_e, newValue) => handleUpdateBlacklist(index, 'type', newValue || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Service"
                        placeholder="Select service"
                        color="success"
                        required={true}
                        error={item.type === '' || !!duplicateError}
                        helperText={duplicateError || (item.type === '' ? 'Service is required' : ' ')}
                        FormHelperTextProps={{
                          sx: { minHeight: '1.25rem' },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <Tooltip
                              title="Select the type of service node this blacklist rule applies to."
                              placement="top"
                            >
                              <HelpIcon className={styles.descriptionIcon} />
                            </Tooltip>
                          ),
                        }}
                      />
                    )}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        paddingRight: '14px !important',
                      },
                    }}
                  />
                  <Autocomplete
                    key={`${index}-${item.type}`}
                    size="small"
                    options={getConfigOptions(item.type, index)}
                    value={taskTypeOptions.find((opt) => opt.value === item.config) || null}
                    onChange={(_e, newValue) => {
                      const value = newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : '';
                      handleUpdateBlacklist(index, 'config', value);
                    }}
                    getOptionLabel={(option) => {
                      if (typeof option === 'string') {
                        const found = taskTypeOptions.find((opt) => opt.value === option);
                        return found ? found.label : option;
                      }
                      return option.label;
                    }}
                    isOptionEqualToValue={(option, value) => {
                      if (typeof value === 'string') {
                        return option.value === value;
                      }
                      return option.value === value.value;
                    }}
                    disabled={!item.type}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Task Type"
                        placeholder="Select task type"
                        color="success"
                        required={item.type !== ''}
                        error={(item.type !== '' && item.config === '') || !!duplicateError}
                        helperText={
                          duplicateError || (item.type !== '' && item.config === '' ? 'Task Type is required' : ' ')
                        }
                        FormHelperTextProps={{
                          sx: { minHeight: '1.25rem' },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <Tooltip title="Select the type of task this blacklist rule applies to." placement="top">
                              <HelpIcon className={styles.descriptionIcon} />
                            </Tooltip>
                          ),
                        }}
                      />
                    )}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        paddingRight: '14px !important',
                      },
                    }}
                  />
                  <Autocomplete
                    key={`${index}-${item.type}-${item.config}`}
                    size="small"
                    options={getSubConfigOptions(item.type, item.config, index)}
                    value={item.subConfig}
                    onChange={(_e, newValue) => handleUpdateBlacklist(index, 'subConfig', newValue || '')}
                    getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
                    disabled={!item.type || !item.config}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Feature"
                        placeholder="Select feature"
                        color="success"
                        required={item.type !== '' && item.config !== ''}
                        error={(item.type !== '' && item.config !== '' && item.subConfig === '') || !!duplicateError}
                        helperText={
                          duplicateError ||
                          (item.type !== '' && item.config !== '' && item.subConfig === ''
                            ? 'Feature is required'
                            : ' ')
                        }
                        FormHelperTextProps={{
                          sx: { minHeight: '1.25rem' },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <Tooltip title="Select the operation to block for matched tasks." placement="top">
                              <HelpIcon className={styles.descriptionIcon} />
                            </Tooltip>
                          ),
                        }}
                      />
                    )}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        paddingRight: '14px !important',
                      },
                    }}
                  />
                </Box>

                {/* 第二行+: Applications | URLs | Tags | Priorities (两列Grid布局) */}
                <Grid container spacing={1.5}>
                  {/* 第三行: Applications | URLs */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      size="small"
                      multiple
                      freeSolo
                      options={[]}
                      value={item.applications}
                      onChange={(_e, newValue) => handleUpdateBlacklist(index, 'applications', newValue || [])}
                      disabled={!item.type || !item.config || !item.subConfig}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Applications"
                          placeholder="Enter values or press Enter to add"
                          color="success"
                          helperText=" "
                          FormHelperTextProps={{
                            sx: { minHeight: '1.25rem' },
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <Tooltip
                                title="Specify the application names to which this blacklist rule applies."
                                placement="top"
                              >
                                <HelpIcon className={styles.descriptionIcon} />
                              </Tooltip>
                            ),
                          }}
                        />
                      )}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          minHeight: '3.25rem',
                          paddingRight: '14px !important',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      size="small"
                      multiple
                      freeSolo
                      options={[]}
                      value={item.urls}
                      onChange={(_e, newValue) => {
                        // 校验每个新输入的值是否是合法 URL
                        const validatedValues = (newValue || []).filter((v) => {
                          // 如果是从选项中选择的（不太可能，因为options是空数组），直接放行
                          if (typeof v !== 'string') return true;
                          // 对自由输入的值进行 URL 校验
                          return isValidURL(v);
                        });
                        handleUpdateBlacklist(index, 'urls', validatedValues);
                      }}
                      disabled={!item.type || !item.config || !item.subConfig}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="URLs"
                          placeholder="Enter URL and press Enter"
                          color="success"
                          helperText={
                            params.inputProps.value &&
                            !isValidURL(String(params.inputProps.value || '')) &&
                            String(params.inputProps.value || '').length > 3
                              ? 'Please enter a valid URL'
                              : ' '
                          }
                          FormHelperTextProps={{
                            sx: { minHeight: '1.25rem' },
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          error={
                            params.inputProps.value
                              ? !isValidURL(String(params.inputProps.value || '')) &&
                                String(params.inputProps.value || '').length > 3
                              : false
                          }
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <Tooltip
                                title="Specify one or more URL patterns using regular expressions (regex) to match against task URLs."
                                placement="top"
                              >
                                <HelpIcon className={styles.descriptionIcon} />
                              </Tooltip>
                            ),
                          }}
                        />
                      )}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          minHeight: '3.25rem',
                          paddingRight: '14px !important',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          },
                        },
                      }}
                    />
                  </Grid>

                  {/* 第四行: Tags | Priorities (仅当 subConfig 是 download 时显示) */}
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Autocomplete
                      size="small"
                      multiple
                      freeSolo
                      options={[]}
                      value={item.tags}
                      onChange={(_e, newValue) => handleUpdateBlacklist(index, 'tags', newValue || [])}
                      disabled={!item.type || !item.config || !item.subConfig}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Tags"
                          placeholder="Enter values or press Enter to add"
                          color="success"
                          helperText=" "
                          FormHelperTextProps={{
                            sx: { minHeight: '1.25rem' },
                          }}
                          InputLabelProps={{
                            shrink: true,
                          }}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: (
                              <Tooltip title="Specify tags to match against task tags." placement="top">
                                <HelpIcon className={styles.descriptionIcon} />
                              </Tooltip>
                            ),
                          }}
                        />
                      )}
                      sx={{
                        width: '100%',
                        '& .MuiOutlinedInput-root': {
                          minHeight: '3.25rem',
                          paddingRight: '14px !important',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.06)',
                          },
                        },
                      }}
                    />
                  </Grid>
                  {isSubConfigDownload ? (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Autocomplete
                        size="small"
                        multiple
                        options={priorityOptions}
                        value={item.priorities
                          .map((p) => priorityOptions.find((opt) => opt.value === p))
                          .filter((opt): opt is (typeof priorityOptions)[0] => opt !== undefined)}
                        onChange={(_e, newValue) => {
                          const values = newValue.map((v) => v.value);
                          handleUpdateBlacklist(index, 'priorities', values);
                        }}
                        getOptionLabel={(option) => option.label}
                        isOptionEqualToValue={(option, value) => option.value === value.value}
                        disabled={!item.type || !item.config || !item.subConfig}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Priorities"
                            placeholder="Select priorities"
                            color="success"
                            helperText=" "
                            FormHelperTextProps={{
                              sx: { minHeight: '1.25rem' },
                            }}
                            InputLabelProps={{
                              shrink: true,
                            }}
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <Tooltip
                                  title="Specify the task priority levels to which this blacklist rule applies."
                                  placement="top"
                                >
                                  <HelpIcon className={styles.descriptionIcon} />
                                </Tooltip>
                              ),
                            }}
                          />
                        )}
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            minHeight: '3.25rem',
                            paddingRight: '14px !important',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            },
                            '&.Mui-focused': {
                              backgroundColor: 'rgba(255, 255, 255, 0.06)',
                            },
                          },
                        }}
                      />
                    </Grid>
                  ) : (
                    <Grid size={{ xs: 12, md: 6 }} />
                  )}
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{
                      minWidth: 85,
                      color: 'var(--palette-delete-button-color)',
                      borderColor: 'var(--palette-delete-button-color)',
                      ':hover': {
                        backgroundColor: 'var(--palette-delete-button-hover-color)',
                        color: 'var(--palette-common-white)',
                      },
                    }}
                    onClick={() => handleRemoveBlacklist(index)}
                  >
                    <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
                    <div style={{ paddingTop: '0.25rem' }}>Delete</div>
                  </Button>
                </Box>
              </Box>
            );
          })}
      </Box>
    </>
  );
};

export default memo(forwardRef(BlacklistConfig));
