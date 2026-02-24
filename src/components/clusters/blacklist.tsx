import { Autocomplete, Box, Button, TextField, Tooltip, Typography } from '@mui/material';
import { forwardRef, memo, Ref, useEffect, useImperativeHandle, useState } from 'react';
import HelpIcon from '@mui/icons-material/Help';
import styles from './new.module.css';
import AddIcon from '@mui/icons-material/Add';
interface Props {
  clusterInfo?: {
    seed_peer_cluster_config: Record<string, any>;
    peer_cluster_config: Record<string, any>;
    [x: string]: any;
  };
}
const BlacklistConfig = ({ clusterInfo }: Props, ref: Ref<unknown> | undefined) => {
  const [blacklist, setBlacklist] = useState<
    { type: string; config: string; subConfig: string; options: string[]; optionValues: Record<string, string[]> }[]
  >([]);

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
          duplicates.set(index, 'This combination already exists');
        });
      }
    });

    return duplicates;
  };

  const blacklistTypeOptions = ['Client', 'Seed Client'];

  // 检查type+config+subconfig组合是否已存在
  const isCombinationExists = (type: string, config: string, subConfig: string, excludeIndex?: number) => {
    return blacklist.some((item, index) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return false;
      }
      return item.type === type && item.config === config && item.subConfig === subConfig;
    });
  };

  // 获取配置选项
  const getConfigOptions = (type: string) => {
    if (!type) return [];
    return ['task', 'persistent_cache_task', 'persistent_task'];
  };

  // 获取子配置选项
  const getSubConfigOptions = (type: string, config: string) => {
    if (!type || !config) return [];

    // 如果config是task，则只返回download
    if (config === 'task') {
      return ['download'];
    }
    return ['download', 'upload'];
  };

  // 获取多选选项
  const getOptions = (subConfig: string) => {
    const baseOptions = ['Applications', 'URLs', 'Tags'];
    if (subConfig === 'download') {
      return [...baseOptions, 'Priorities'];
    }
    return baseOptions;
  };

  // 获取所有 Type 选项（不再过滤已存在的类型）
  const getAvailableTypes = () => {
    return blacklistTypeOptions;
  };

  const handleAddBlacklist = () => {
    const newType = blacklistTypeOptions[0];
    const newConfig = '';
    const newSubConfig = '';

    // 检查是否已存在相同的组合
    if (isCombinationExists(newType, newConfig, newSubConfig)) {
      // 如果存在，则使用空值创建，让用户手动选择
      setBlacklist([...blacklist, { type: '', config: '', subConfig: '', options: [], optionValues: {} }]);
    } else {
      setBlacklist([
        ...blacklist,
        { type: newType, config: newConfig, subConfig: newSubConfig, options: [], optionValues: {} },
      ]);
    }
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
    }

    // 检查是否会导致重复组合（仅当三个字段都有值时检查）
    if (newType && newConfig && newSubConfig) {
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
        options: [],
        optionValues: {},
      };
    } else if (field === 'config') {
      newBlacklist[index] = {
        ...newBlacklist[index],
        config: newConfig,
        subConfig: newSubConfig,
        options: [],
        optionValues: {},
      };
    } else if (field === 'subConfig') {
      newBlacklist[index] = {
        ...newBlacklist[index],
        subConfig: newSubConfig,
        options: [],
        optionValues: {},
      };
    } else {
      newBlacklist[index] = { ...newBlacklist[index], [field]: value };
    }

    setBlacklist(newBlacklist);
  };

  // 处理blacklist数据转换
  const processBlacklist = (blacklist: any) => {
    const peerBlockList: any = {};
    const seedPeerBlockList: any = {};

    blacklist.forEach((item: any) => {
      if (!item.type || !item.config || !item.subConfig || !item.options || item.options.length === 0) {
        return;
      }

      const targetBlockList = item.type === 'Client' ? peerBlockList : seedPeerBlockList;
      const configKey = item.config === 'persistent_cache_task' ? 'persistent_task' : item.config;

      if (!targetBlockList[configKey]) {
        targetBlockList[configKey] = {};
      }

      if (!targetBlockList[configKey][item.subConfig]) {
        targetBlockList[configKey][item.subConfig] = {};
      }

      item.options.forEach((option: any) => {
        const values = item.optionValues[option] || [];
        const key = option.toLowerCase();
        if (values.length > 0) {
          targetBlockList[configKey][item.subConfig][key] = values;
        }
      });
    });

    return { peerBlockList, seedPeerBlockList };
  };

  // 逆向转换：将 API 返回的 block_list 数据转换回原始格式
  const reverseBlacklistFromData = (
    peerClusterConfig: { block_list?: any },
    seedPeerClusterConfig: { block_list?: any },
  ) => {
    const result: Array<{
      type: string;
      config: string;
      subConfig: string;
      options: string[];
      optionValues: Record<string, string[]>;
    }> = [];

    // 处理 peer_cluster_config.block_list (Client 类型)
    const peerBlockList = peerClusterConfig?.block_list;
    if (peerBlockList && typeof peerBlockList === 'object') {
      Object.keys(peerBlockList).forEach((config) => {
        const configData = peerBlockList[config];
        if (configData && typeof configData === 'object') {
          Object.keys(configData).forEach((subConfig) => {
            const subConfigData = configData[subConfig];
            if (subConfigData && typeof subConfigData === 'object') {
              const options: string[] = [];
              const optionValues: Record<string, string[]> = {};

              Object.keys(subConfigData).forEach((key) => {
                const optionName = key.charAt(0).toUpperCase() + key.slice(1);
                if (Array.isArray(subConfigData[key])) {
                  options.push(optionName);
                  optionValues[optionName] = subConfigData[key];
                }
              });

              if (options.length > 0) {
                result.push({
                  type: 'Client',
                  config: config === 'persistent_task' ? 'persistent_cache_task' : config,
                  subConfig,
                  options,
                  optionValues,
                });
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
              const options: string[] = [];
              const optionValues: Record<string, string[]> = {};

              Object.keys(subConfigData).forEach((key) => {
                const optionName = key.charAt(0).toUpperCase() + key.slice(1);
                options.push(optionName);
                optionValues[optionName] = Array.isArray(subConfigData[key]) ? subConfigData[key] : [];
              });

              if (options.length > 0) {
                result.push({
                  type: 'Seed Client',
                  config: config === 'persistent_task' ? 'persistent_cache_task' : config,
                  subConfig,
                  options,
                  optionValues,
                });
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
        <Tooltip title=" The configuration for P2P downloads." placement="top">
          <HelpIcon className={styles.descriptionIcon} />
        </Tooltip>
        <Button
          id="create-cluster"
          size="small"
          sx={{
            marginLeft: '0.25rem',
            backgroundColor: 'var(--palette-button-color)',
            color: 'var(--palette-button-text-color)',
            '&:hover': {
              backgroundColor: 'var(--palette-button-hover-color)',
            },
            '&.Mui-disabled': {
              backgroundColor: 'var(--palette-action-disabledBackground)',
              color: 'var(--palette-action-disabled)',
            },
          }}
          variant="contained"
          onClick={handleAddBlacklist}
          disabled={false}
        >
          <AddIcon fontSize="small" sx={{ mr: '0.4rem' }} />
          <div style={{ paddingTop: '0.25rem' }}>Add blacklist ({blacklist.length})</div>
        </Button>
      </Box>
      <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {blacklist.length > 0 &&
          blacklist.map((item, index) => {
            const duplicateInfo = getDuplicateInfo();
            const duplicateError = duplicateInfo.get(index);
            return (
              <Box
                key={`${index}-${item.type}`}
                sx={{
                  border: '1px solid var(--palette-divider-color)',
                  borderRadius: 1,
                  p: 1.5,
                  backgroundColor: 'var(--palette-background-paper)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
                }}
              >
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Autocomplete
                    size="small"
                    options={getAvailableTypes()}
                    value={item.type}
                    onChange={(_e, newValue) => handleUpdateBlacklist(index, 'type', newValue || '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Type"
                        placeholder="Select type"
                        sx={{ minWidth: 100 }}
                        color="success"
                        required={true}
                        error={item.type === '' || !!duplicateError}
                        helperText={duplicateError || (item.type === '' ? 'Type is required' : '')}
                      />
                    )}
                    sx={{ flex: 1 }}
                  />
                  <Autocomplete
                    size="small"
                    options={getConfigOptions(item.type)}
                    value={item.config}
                    onChange={(_e, newValue) => handleUpdateBlacklist(index, 'config', newValue || '')}
                    disabled={!item.type}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Config"
                        placeholder="Select config"
                        sx={{ minWidth: 100 }}
                        color="success"
                        required={item.type !== ''}
                        error={(item.type !== '' && item.config === '') || !!duplicateError}
                        helperText={
                          duplicateError || (item.type !== '' && item.config === '' ? 'Config is required' : '')
                        }
                      />
                    )}
                    sx={{ flex: 1 }}
                  />
                  <Autocomplete
                    size="small"
                    options={getSubConfigOptions(item.type, item.config)}
                    value={item.subConfig}
                    onChange={(_e, newValue) => handleUpdateBlacklist(index, 'subConfig', newValue || '')}
                    disabled={!item.type || !item.config}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Sub Config"
                        placeholder="Select sub config"
                        sx={{ minWidth: 100 }}
                        color="success"
                        required={item.type !== '' && item.config !== ''}
                        error={(item.type !== '' && item.config !== '' && item.subConfig === '') || !!duplicateError}
                        helperText={
                          duplicateError ||
                          (item.type !== '' && item.config !== '' && item.subConfig === ''
                            ? 'Sub Config is required'
                            : '')
                        }
                      />
                    )}
                    sx={{ flex: 1 }}
                  />
                  <Autocomplete
                    size="small"
                    multiple
                    freeSolo
                    options={getOptions(item.subConfig)}
                    value={item.options || []}
                    onChange={(_e, newValue) => handleUpdateBlacklist(index, 'options', newValue || [])}
                    disabled={!item.type || !item.config || !item.subConfig}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Options"
                        placeholder="Select options or press Enter to add custom"
                        sx={{ minWidth: 150 }}
                        color="success"
                        required={item.type !== '' && item.config !== '' && item.subConfig !== ''}
                        error={
                          item.type !== '' &&
                          item.config !== '' &&
                          item.subConfig !== '' &&
                          (!item.options || item.options.length === 0)
                        }
                        helperText={
                          item.type !== '' &&
                          item.config !== '' &&
                          item.subConfig !== '' &&
                          (!item.options || item.options.length === 0)
                            ? 'At least one option is required'
                            : ''
                        }
                      />
                    )}
                    sx={{ flex: 1.5 }}
                  />
                </Box>
                {item.options && item.options.length > 0 && (
                  <Box sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {item.options.map((option) => (
                      <Autocomplete
                        key={option}
                        size="small"
                        multiple
                        freeSolo
                        options={[]}
                        value={item.optionValues[option] || []}
                        onChange={(_e, newValue) => {
                          const newOptionValues = { ...item.optionValues };
                          newOptionValues[option] = newValue || [];
                          handleUpdateBlacklist(index, 'optionValues', newOptionValues);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={option}
                            placeholder={`Enter ${option} values or press Enter to add custom`}
                            color="success"
                          />
                        )}
                      />
                    ))}
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button
                    size="small"
                    sx={{
                      minWidth: 70,
                      color: 'var(--palette-error-main)',
                      borderColor: 'var(--palette-error-main)',
                      '&:hover': {
                        backgroundColor: 'var(--palette-error-light)',
                        color: 'var(--palette-error-contrastText)',
                      },
                    }}
                    onClick={() => handleRemoveBlacklist(index)}
                  >
                    Remove
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
