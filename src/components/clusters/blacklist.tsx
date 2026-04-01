import { Autocomplete, Box, Button, Grid, TextField, Tooltip, Typography, Paper } from '@mui/material';
import { forwardRef, memo, Ref, useEffect, useImperativeHandle, useState, useMemo, useCallback } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import styles from './new.module.css';
import AddIcon from '@mui/icons-material/Add';
import type { BlockListConfig } from '../../lib/api';

/**
 * 黑名单配置项
 * 用于前端表单展示和编辑
 */
interface BlacklistItem {
  /** 类型: Client 或 Seed Client */
  type: string;
  /** 任务配置类型: task, persistent_cache_task, persistent_task */
  config: string;
  /** 子配置类型: download, upload */
  subConfig: string;
  /** 应用名称列表 */
  applications: string[];
  /** URL 正则表达式列表 */
  urls: string[];
  /** 标签列表 */
  tags: string[];
  /** 优先级列表 (字符串格式,用于表单) */
  priorities: string[];
}

interface Props {
  clusterInfo?: {
    seed_peer_cluster_config?: {
      load_limit?: number;
      block_list?: BlockListConfig;
    };
    peer_cluster_config?: {
      load_limit?: number;
      block_list?: BlockListConfig;
    };
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

// 任务类型选项类型定义
interface TaskTypeOption {
  value: string;
  label: string;
}

const taskTypeOptions: TaskTypeOption[] = [
  { value: 'task', label: 'Task' },
  { value: 'persistent_cache_task', label: 'Persistent Cache Task' },
  { value: 'persistent_task', label: 'Persistent Task' },
];

// 黑名单类型选项
const blacklistTypeOptions = ['Client', 'Seed Client'] as const;

const AUTOCOMPLETE_TEXTFIELD_SX = {
  width: '100%',
  '& .MuiOutlinedInput-root': {
    // minHeight: '3.25rem',
    paddingRight: '14px !important',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
    '&.Mui-focused': {
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
    },
  },
} as const;

const AUTOCOMPLETE_SX = {
  flex: 1,
  '& .MuiOutlinedInput-root': {
    paddingRight: '14px !important',
  },
} as const;

// 单个字段包装器样式 - 带右边框分隔线，表单项垂直水平居中
const FIELD_WRAPPER_SX = {
  flex: 1,
  minWidth: 0,
  p: 1.5,
  paddingTop: 4,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  maxWidth: '50%',
  '&:not(:last-child)': {
    borderRight: '1px solid',
    borderColor: 'divider',
  },
} as const;

// 字段行容器样式 - 共享边框，只有底部边框线
const FIELD_ROW_SX = {
  display: 'flex',
  alignItems: 'stretch',
  borderBottom: '1px solid',
  borderColor: 'divider',
} as const;

// 第一行字段包装器样式 - 无上边距
const FIRST_FIELD_WRAPPER_SX = {
  ...FIELD_WRAPPER_SX,
  pt: 4,
} as const;

// 删除按钮区域样式 - 与字段区域共享边框
const DELETE_BUTTON_ROW_SX = {
  display: 'flex',
  alignItems: 'center',
  p: 1,
  borderTop: '1px solid',
  borderColor: 'divider',
} as const;

const FORM_HELPER_TEXT_SX = { minHeight: '1.25rem' } as const;

interface BlacklistItemCardProps {
  item: BlacklistItem;
  index: number;
  duplicateError?: string;
  onUpdate: (index: number, field: string, value: any) => void;
  onRemove: (index: number) => void;
  getAvailableTypes: () => string[];
  getConfigOptions: (type: string, excludeIndex?: number) => TaskTypeOption[];
  getSubConfigOptions: (type: string, config: string, excludeIndex?: number) => string[];
}

const BlacklistItemCard = memo(
  ({
    item,
    index,
    duplicateError,
    onUpdate,
    onRemove,
    getAvailableTypes,
    getConfigOptions,
    getSubConfigOptions,
  }: BlacklistItemCardProps) => {
    const isSubConfigDownload = item.subConfig === 'download';

    // 优先级选择器的值转换
    const priorityValue = useMemo(
      () =>
        item.priorities
          .map((p) => priorityOptions.find((opt) => opt.value === p))
          .filter((opt): opt is (typeof priorityOptions)[0] => opt !== undefined),
      [item.priorities],
    );

    // 统一的更新处理器
    const handleFieldUpdate = useCallback(
      (field: string, value: any) => {
        onUpdate(index, field, value);
      },
      [index, onUpdate],
    );

    // 统一的删除处理器
    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    // URL 校验处理器
    const handleURLsChange = useCallback(
      (_e: any, newValue: string[]) => {
        const validatedValues = (newValue || []).filter((v) => {
          if (typeof v !== 'string') return true;
          return isValidURL(v);
        });
        handleFieldUpdate('urls', validatedValues);
      },
      [handleFieldUpdate],
    );

    // 优先级变更处理器
    const handlePrioritiesChange = useCallback(
      (_e: any, newValue: Array<{ value: string; label: string }>) => {
        const values = newValue.map((v) => v.value);
        handleFieldUpdate('priorities', values);
      },
      [handleFieldUpdate],
    );

    // 公共的 TextField 渲染函数
    const renderTextField = useCallback(
      (
        params: any,
        label: string,
        placeholder: string,
        tooltip: string,
        required: boolean,
        error: boolean,
        helperText: string,
        shrink?: boolean,
      ) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          color="success"
          required={required}
          error={error}
          helperText={helperText}
          FormHelperTextProps={{ sx: FORM_HELPER_TEXT_SX }}
          InputLabelProps={shrink ? { shrink: true } : undefined}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <Tooltip title={tooltip} placement="top">
                <HelpIcon className={styles.descriptionIcon} />
              </Tooltip>
            ),
          }}
        />
      ),
      [],
    );

    // 第一行字段是否禁用
    const isFirstRowDisabled = !item.type || !item.config || !item.subConfig;

    return (
      <Paper
        key={`${index}-${item.type}`}
        data-testid="blacklist-item"
        elevation={0}
        sx={{
          width: '100%',
          backgroundColor: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'var(--palette-card-box-shadow)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderColor: 'var(--palette-button-color)',
            boxShadow: '0 2px 8px rgba(0, 122, 255, 0.1)',
          },
        }}
      >
        {/* 第一行: Type | Config | Sub Config */}
        <Box sx={FIELD_ROW_SX}>
          <Box sx={FIRST_FIELD_WRAPPER_SX}>
            <Autocomplete
              size="small"
              limitTags={3}
              options={getAvailableTypes()}
              value={item.type}
              onChange={(_e, newValue) => handleFieldUpdate('type', newValue || '')}
              renderInput={(params) =>
                renderTextField(
                  params,
                  'Service',
                  'Select service',
                  'Select the type of service node this blacklist rule applies to.',
                  true,
                  item.type === '' || !!duplicateError,
                  duplicateError || (item.type === '' ? 'Service is required' : ' '),
                )
              }
              sx={AUTOCOMPLETE_SX}
            />
          </Box>
          <Box sx={FIRST_FIELD_WRAPPER_SX}>
            <Autocomplete
              key={`${index}-${item.type}`}
              size="small"
              limitTags={3}
              options={getConfigOptions(item.type, index)}
              value={taskTypeOptions.find((opt) => opt.value === item.config) || null}
              onChange={(_e, newValue) => {
                const value = newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : '';
                handleFieldUpdate('config', value);
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
              renderInput={(params) =>
                renderTextField(
                  params,
                  'Task Type',
                  'Select task type',
                  'Select the type of task this blacklist rule applies to.',
                  item.type !== '',
                  (item.type !== '' && item.config === '') || !!duplicateError,
                  duplicateError || (item.type !== '' && item.config === '' ? 'Task Type is required' : ' '),
                )
              }
              sx={AUTOCOMPLETE_SX}
            />
          </Box>
          <Box sx={FIRST_FIELD_WRAPPER_SX}>
            <Autocomplete
              key={`${index}-${item.type}-${item.config}`}
              size="small"
              limitTags={3}
              options={getSubConfigOptions(item.type, item.config, index)}
              value={item.subConfig}
              onChange={(_e, newValue) => handleFieldUpdate('subConfig', newValue || '')}
              getOptionLabel={(option) => option.charAt(0).toUpperCase() + option.slice(1)}
              disabled={!item.type || !item.config}
              renderInput={(params) =>
                renderTextField(
                  params,
                  'Feature',
                  'Select feature',
                  'Select the operation to block for matched tasks.',
                  item.type !== '' && item.config !== '',
                  (item.type !== '' && item.config !== '' && item.subConfig === '') || !!duplicateError,
                  duplicateError ||
                    (item.type !== '' && item.config !== '' && item.subConfig === '' ? 'Feature is required' : ' '),
                )
              }
              sx={AUTOCOMPLETE_SX}
            />
          </Box>
        </Box>

        {/* 第二行: Applications | Tags */}
        <Box sx={FIELD_ROW_SX}>
          <Box sx={FIELD_WRAPPER_SX}>
            <Autocomplete
              size="small"
              multiple
              freeSolo
              limitTags={3}
              options={[]}
              value={item.applications}
              onChange={(_e, newValue) => handleFieldUpdate('applications', newValue || [])}
              disabled={isFirstRowDisabled}
              renderInput={(params) =>
                renderTextField(
                  params,
                  'Applications',
                  'Enter values or press Enter to add',
                  'Specify the application names to which this blacklist rule applies.',
                  false,
                  false,
                  ' ',
                  true,
                )
              }
              sx={AUTOCOMPLETE_TEXTFIELD_SX}
            />
          </Box>
          <Box
            sx={{
              ...FIELD_WRAPPER_SX,
              width: '50%',
              flex: 'none',
              borderRight: 'none',
            }}
          >
            <Autocomplete
              size="small"
              multiple
              freeSolo
              limitTags={3}
              options={[]}
              value={item.tags}
              onChange={(_e, newValue) => handleFieldUpdate('tags', newValue || [])}
              disabled={isFirstRowDisabled}
              renderInput={(params) =>
                renderTextField(
                  params,
                  'Tags',
                  'Enter values or press Enter to add',
                  'Specify tags to match against task tags.',
                  false,
                  false,
                  ' ',
                  true,
                )
              }
              sx={AUTOCOMPLETE_TEXTFIELD_SX}
            />
          </Box>
        </Box>

        {/* 第三行: Urls | Priorities (download) 或 Urls | Delete (upload) */}
        <Box sx={{ ...FIELD_ROW_SX, borderBottom: isSubConfigDownload ? '1px solid' : 'none', borderColor: 'divider' }}>
          <Box
            sx={{
              ...FIELD_WRAPPER_SX,

              borderRight: !isSubConfigDownload ? 'none !important' : '1px solid divider !important',
            }}
          >
            <Autocomplete
              size="small"
              multiple
              freeSolo
              limitTags={3}
              options={[]}
              value={item.urls}
              onChange={handleURLsChange}
              disabled={isFirstRowDisabled}
              renderInput={(params) => {
                const inputValue = String(params.inputProps.value || '');
                const isInvalid = inputValue.length > 3 && !isValidURL(inputValue);

                return renderTextField(
                  params,
                  'URLs',
                  'Enter URL and press Enter',
                  'Specify one or more URL patterns using regular expressions (regex) to match against task URLs.',
                  false,
                  isInvalid,
                  isInvalid ? 'Please enter a valid URL' : ' ',
                  true,
                );
              }}
              sx={AUTOCOMPLETE_TEXTFIELD_SX}
            />
          </Box>

          {isSubConfigDownload ? (
            <Box sx={{ ...FIELD_WRAPPER_SX, width: '50%', flex: 'none', borderRight: 'none' }}>
              <Autocomplete
                size="small"
                multiple
                limitTags={5}
                options={priorityOptions}
                value={priorityValue}
                onChange={handlePrioritiesChange}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                disabled={isFirstRowDisabled}
                renderInput={(params) =>
                  renderTextField(
                    params,
                    'Priorities',
                    'Select priorities',
                    'Specify the task priority levels to which this blacklist rule applies.',
                    false,
                    false,
                    ' ',
                    true,
                  )
                }
                sx={AUTOCOMPLETE_TEXTFIELD_SX}
              />
            </Box>
          ) : (
            /* 删除按钮 - upload 时与 Tags 同一行，无垂直边框 */
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', p: 1.5, flex: 1 }}>
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
                onClick={handleRemove}
              >
                <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
                <div style={{ paddingTop: '0.25rem' }}>Delete</div>
              </Button>
            </Box>
          )}
        </Box>

        {/* 第四行: Delete 按钮 - download 时单独一行 */}
        {isSubConfigDownload && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1.5 }}>
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
              onClick={handleRemove}
            >
              <DeleteIcon fontSize="small" sx={{ mr: '0.4rem' }} />
              <div style={{ paddingTop: '0.25rem' }}>Delete</div>
            </Button>
          </Box>
        )}
      </Paper>
    );
  },
);

BlacklistItemCard.displayName = 'BlacklistItemCard';

const BlacklistConfig = ({ clusterInfo }: Props, ref: Ref<unknown> | undefined) => {
  const [blacklist, setBlacklist] = useState<BlacklistItem[]>([]);

  // 获取重复的组合信息
  const duplicateInfo = useMemo(() => {
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
  }, [blacklist]);

  // 检查type+config+subconfig组合是否已存在
  const isCombinationExists = useCallback(
    (type: string, config: string, subConfig: string, excludeIndex?: number) => {
      return blacklist.some((item, index) => {
        if (excludeIndex !== undefined && index === excludeIndex) {
          return false;
        }
        return item.type === type && item.config === config && item.subConfig === subConfig;
      });
    },
    [blacklist],
  );

  // 获取子配置选项
  const getSubConfigOptions = useCallback(
    (type: string, config: string, excludeIndex?: number) => {
      if (!type || !config) return [];

      let options = config === 'task' ? ['download'] : ['download', 'upload'];

      return options.filter((subConfig) => !isCombinationExists(type, config, subConfig, excludeIndex));
    },
    [isCombinationExists],
  );

  // 获取配置选项
  const getConfigOptions = useCallback(
    (type: string, excludeIndex?: number) => {
      if (!type) return [];

      return taskTypeOptions.filter((option) => {
        const possibleSubConfigs = getSubConfigOptions(type, option.value, excludeIndex);
        return possibleSubConfigs.length > 0;
      });
    },
    [getSubConfigOptions],
  );

  // 获取所有 Type 选项 - blacklistTypeOptions 是常量，无需 useCallback
  const getAvailableTypes = useCallback(() => {
    return [...blacklistTypeOptions];
  }, []);

  // 检查是否所有可能的组合都已被使用
  const isAllCombinationsUsed = useMemo(() => {
    for (const type of blacklistTypeOptions) {
      for (const taskType of taskTypeOptions) {
        const subConfigs = taskType.value === 'task' ? ['download'] : ['download', 'upload'];

        for (const subConfig of subConfigs) {
          if (!isCombinationExists(type, taskType.value, subConfig)) {
            return false;
          }
        }
      }
    }

    return true;
  }, [isCombinationExists]);

  const handleAddBlacklist = useCallback(() => {
    setBlacklist([
      ...blacklist,
      { type: '', config: '', subConfig: '', applications: [], urls: [], tags: [], priorities: [] },
    ]);
  }, [blacklist]);

  const handleRemoveBlacklist = useCallback((index: number) => {
    setBlacklist((prev) => {
      const newBlacklist = [...prev];
      newBlacklist.splice(index, 1);
      return newBlacklist;
    });
  }, []);

  const handleUpdateBlacklist = useCallback(
    (index: number, field: string, value: any) => {
      setBlacklist((prev) => {
        const newBlacklist = [...prev];
        const currentItem = newBlacklist[index];

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

          // 检查完整的组合是否重复
          if (newType && newConfig && newSubConfig) {
            if (isCombinationExists(newType, newConfig, newSubConfig, index)) {
              return prev; // 不更新
            }
          }
        }

        // 对于 config 字段，检查是否会创建重复组合
        if (field === 'config' && newType && newConfig && newSubConfig) {
          if (isCombinationExists(newType, newConfig, newSubConfig, index)) {
            return prev; // 不更新
          }
        }

        // 应用更新
        if (field === 'type') {
          newBlacklist[index] = {
            ...newBlacklist[index],
            type: newType,
            config: newConfig,
            subConfig: newSubConfig,
          };
        } else if (field === 'config') {
          newBlacklist[index] = {
            ...newBlacklist[index],
            config: newConfig,
            subConfig: newSubConfig,
          };
        } else if (field === 'subConfig') {
          newBlacklist[index] = {
            ...newBlacklist[index],
            subConfig: newSubConfig,
          };
        } else {
          newBlacklist[index] = { ...newBlacklist[index], [field]: value };
        }

        return newBlacklist;
      });
    },
    [isCombinationExists],
  );

  // 处理blacklist数据转换
  const processBlacklist = (blacklist: BlacklistItem[]) => {
    const peerBlockList: BlockListConfig = {};
    const seedPeerBlockList: BlockListConfig = {};

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

      if (!targetBlockList[configKey]![item.subConfig]) {
        targetBlockList[configKey]![item.subConfig] = {};
      }

      if (item.applications.length > 0) {
        targetBlockList[configKey]![item.subConfig]!.applications = item.applications;
      }
      if (item.urls.length > 0) {
        targetBlockList[configKey]![item.subConfig]!.urls = item.urls;
      }
      if (item.tags.length > 0) {
        targetBlockList[configKey]![item.subConfig]!.tags = item.tags;
      }
      if (item.priorities.length > 0) {
        // 将 priorities 从字符串数组转换为整数数组
        targetBlockList[configKey]![item.subConfig]!.priorities = item.priorities.map((p) => parseInt(p, 10));
      }
    });

    return { peerBlockList, seedPeerBlockList };
  };

  // 逆向转换：将 API 返回的 block_list 数据转换回原始格式
  const reverseBlacklistFromData = (
    peerClusterConfig?: { block_list?: BlockListConfig },
    seedPeerClusterConfig?: { block_list?: BlockListConfig },
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
    setBlacklist: (
      peerClusterConfig?: { block_list?: BlockListConfig },
      seedPeerClusterConfig?: { block_list?: BlockListConfig },
    ) => {
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

      {/* ADD BLACKLIST 按钮 */}
      <Box sx={{ mt: 1, mb: 1.5 }}>
        <Button
          id="create-cluster"
          size="small"
          variant="outlined"
          disabled={isAllCombinationsUsed}
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
        {blacklist.map((item, index) => (
          <BlacklistItemCard
            key={`${index}-${item.type}`}
            item={item}
            index={index}
            duplicateError={duplicateInfo.get(index)}
            onUpdate={handleUpdateBlacklist}
            onRemove={handleRemoveBlacklist}
            getAvailableTypes={getAvailableTypes}
            getConfigOptions={getConfigOptions}
            getSubConfigOptions={getSubConfigOptions}
          />
        ))}
      </Box>
    </>
  );
};

export default memo(forwardRef(BlacklistConfig));
