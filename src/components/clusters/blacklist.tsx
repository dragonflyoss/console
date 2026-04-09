import { Autocomplete, Box, Button, Grid, TextField, Tooltip, Typography, Paper } from '@mui/material';
import { forwardRef, memo, Ref, useEffect, useImperativeHandle, useState, useMemo, useCallback } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import HelpIcon from '@mui/icons-material/Help';
import styles from './new.module.css';
import AddIcon from '@mui/icons-material/Add';
import type { BlockListConfig } from '../../lib/api';

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

// URL regex validation - supports both domain names and IP addresses
const URL_PATTERN =
  /^(https?:\/\/)?(?:(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}|(?:\d{1,3}\.){3}\d{1,3}|localhost)(?::\d{1,5})?(?:\/[^\s]*)?$/;

const isValidURL = (value: string): boolean => {
  return URL_PATTERN.test(value);
};

// Strictly determine whether it is a plain object (excluding null, arrays, etc.)
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

const priorityOptions = [
  { value: '1', label: 'Level 1' },
  { value: '2', label: 'Level 2' },
  { value: '3', label: 'Level 3' },
  { value: '4', label: 'Level 4' },
  { value: '5', label: 'Level 5' },
];

// Task type option type definition
interface TaskTypeOption {
  value: string;
  label: string;
}

const taskTypeOptions: TaskTypeOption[] = [
  { value: 'task', label: 'Task' },
  { value: 'persistent_cache_task', label: 'Persistent Cache Task' },
  { value: 'persistent_task', label: 'Persistent Task' },
];

// Blacklist type options
const blacklistTypeOptions = ['Client', 'Seed Client'] as const;

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

    // Priority selector value transformation
    const priorityValue = useMemo(
      () =>
        item.priorities
          .map((p) => priorityOptions.find((opt) => opt.value === p))
          .filter((opt): opt is (typeof priorityOptions)[0] => opt !== undefined),
      [item.priorities],
    );

    // Unified update handler
    const handleFieldUpdate = useCallback(
      (field: string, value: any) => {
        onUpdate(index, field, value);
      },
      [index, onUpdate],
    );

    // Unified delete handler
    const handleRemove = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    // URL validation handler
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

    // Priority change handler
    const handlePrioritiesChange = useCallback(
      (_e: any, newValue: Array<{ value: string; label: string }>) => {
        const values = newValue.map((v) => v.value);
        handleFieldUpdate('priorities', values);
      },
      [handleFieldUpdate],
    );

    // Common TextField render function
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
          FormHelperTextProps={{ sx: { minHeight: '1.25rem' } }}
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

    // Whether the first row fields are disabled
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
        {/* First row: Type | Config | Sub Config */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: 1.5,
              pt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '50%',
              '&:not(:last-child)': {
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <Autocomplete
              size="small"
              limitTags={3}
              options={getAvailableTypes()}
              value={item.type}
              onChange={(_e, newValue) => handleFieldUpdate('Service', newValue || '')}
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
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  paddingRight: '14px !important',
                },
              }}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: 1.5,
              pt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '50%',
              '&:not(:last-child)': {
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <Autocomplete
              key={`${index}-${item.type}`}
              size="small"
              limitTags={3}
              options={getConfigOptions(item.type, index)}
              value={taskTypeOptions.find((opt) => opt.value === item.config) || null}
              onChange={(_e, newValue) => {
                const value = newValue ? (typeof newValue === 'string' ? newValue : newValue.value) : '';
                handleFieldUpdate('Task Type', value);
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
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  paddingRight: '14px !important',
                },
              }}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: 1.5,
              pt: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '50%',
              '&:not(:last-child)': {
                borderRight: '1px solid',
                borderColor: 'divider',
              },
            }}
          >
            <Autocomplete
              key={`${index}-${item.type}-${item.config}`}
              size="small"
              limitTags={3}
              options={getSubConfigOptions(item.type, item.config, index)}
              value={item.subConfig}
              onChange={(_e, newValue) => handleFieldUpdate('Feature', newValue || '')}
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
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  paddingRight: '14px !important',
                },
              }}
            />
          </Box>
        </Box>

        {/* Second row: Applications | Tags */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
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
            }}
          >
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
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
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
          </Box>
          <Box
            sx={{
              minWidth: 0,
              p: 1.5,
              paddingTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
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
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
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
          </Box>
        </Box>

        {/* Third row: Urls | Priorities (download) or Urls | Delete (upload) */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: isSubConfigDownload ? '1px solid' : 'none',
            borderColor: 'divider',
          }}
        >
          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              p: 1.5,
              paddingTop: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              maxWidth: '50%',
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
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
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
          </Box>

          {isSubConfigDownload ? (
            <Box
              sx={{
                minWidth: 0,
                p: 1.5,
                paddingTop: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '50%',
                flex: 'none',
                borderRight: 'none',
              }}
            >
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
                sx={{
                  width: '100%',
                  '& .MuiOutlinedInput-root': {
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
            </Box>
          ) : (
            /* Delete button - on the same row as Tags when upload, no vertical border */
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

        {/* Fourth row: Delete button - separate row when download */}
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

  // Get duplicate combination information
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

  // Check if type+config+subconfig combination already exists
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

  // Get sub-configuration options
  const getSubConfigOptions = useCallback(
    (type: string, config: string, excludeIndex?: number) => {
      if (!type || !config) return [];

      let options = config === 'task' ? ['download'] : ['download', 'upload'];

      return options.filter((subConfig) => !isCombinationExists(type, config, subConfig, excludeIndex));
    },
    [isCombinationExists],
  );

  // Get configuration options
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

  // Get all Type options - blacklistTypeOptions is a constant, no need for useCallback
  const getAvailableTypes = useCallback(() => {
    return [...blacklistTypeOptions];
  }, []);

  // Check if all possible combinations have been used
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

  const fieldStrategies = {
    Service: (value: string) => ({ type: value, config: '', subConfig: '' }),
    'Task Type': (value: string, current: BlacklistItem) => ({
      type: current.type,
      config: value,
      subConfig: value === 'task' ? 'download' : '',
    }),
    Feature: (value: string, current: BlacklistItem) => ({
      type: current.type,
      config: current.config,
      subConfig: value,
    }),
  };
  const handleUpdateBlacklist = useCallback(
    (index: number, field: string, value: any) => {
      setBlacklist((prev) => {
        const currentItem = prev[index];
        const fieldFn = fieldStrategies[field as keyof typeof fieldStrategies];
        const newCurrentItem = fieldFn ? fieldFn(value, currentItem) : { ...currentItem, [field]: value };

        const isComplete = newCurrentItem.type && newCurrentItem.config && newCurrentItem.subConfig;
        if (
          isComplete &&
          isCombinationExists(newCurrentItem.type, newCurrentItem.config, newCurrentItem.subConfig, index)
        ) {
          return prev;
        }

        const newBlacklist = [...prev];
        newBlacklist[index] = { ...currentItem, ...newCurrentItem };
        return newBlacklist;
      });
    },
    [fieldStrategies, isCombinationExists],
  );

  // Process blacklist data transformation
  const processBlacklist = (blacklist: BlacklistItem[]) => {
    const peerBlockList: BlockListConfig = {};
    const seedPeerBlockList: BlockListConfig = {};

    blacklist.forEach((item) => {
      if (!item.type || !item.config || !item.subConfig) {
        return;
      }

      // Check if any option has a value
      const hasAnyOption = item.applications.length || item.urls.length || item.tags.length || item.priorities.length;

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

      if (item.applications.length) {
        targetBlockList[configKey]![item.subConfig]!.applications = item.applications;
      }
      if (item.urls.length) {
        targetBlockList[configKey]![item.subConfig]!.urls = item.urls;
      }
      if (item.tags.length) {
        targetBlockList[configKey]![item.subConfig]!.tags = item.tags;
      }
      if (item.priorities.length) {
        // Convert priorities from string array to integer array
        targetBlockList[configKey]![item.subConfig]!.priorities = item.priorities.map((p) => parseInt(p, 10));
      }
    });

    return { peerBlockList, seedPeerBlockList };
  };

  const getBlacklistItemInfo = (targetBlockList: BlockListConfig, type: 'Client' | 'Seed Client'): BlacklistItem[] => {
    const result: BlacklistItem[] = [];
    if (isPlainObject(targetBlockList)) {
      Object.keys(targetBlockList).forEach((config) => {
        const configData = targetBlockList[config];
        if (isPlainObject(configData)) {
          Object.keys(configData).forEach((subConfig) => {
            const subConfigData = configData[subConfig];
            if (isPlainObject(subConfigData)) {
              const item: BlacklistItem = {
                type,
                config,
                subConfig,
                applications: Array.isArray(subConfigData['applications']) ? subConfigData['applications'] : [],
                urls: Array.isArray(subConfigData['urls']) ? subConfigData['urls'] : [],
                tags: Array.isArray(subConfigData['tags']) ? subConfigData['tags'] : [],
                priorities: Array.isArray(subConfigData['priorities'])
                  ? subConfigData['priorities'].map((p: number) => String(p))
                  : [],
              };

              if (item.applications.length || item.urls.length || item.tags.length || item.priorities.length) {
                result.push(item);
              }
            }
          });
        }
      });
    }
    return result;
  };

  // Reverse transformation: convert API returned block_list data back to original format
  const reverseBlacklistFromData = (
    peerClusterConfig?: { block_list?: BlockListConfig },
    seedPeerClusterConfig?: { block_list?: BlockListConfig },
  ): BlacklistItem[] => {
    let result: BlacklistItem[] = [];

    const peerBlockList = peerClusterConfig?.block_list;
    const seedPeerBlockList = seedPeerClusterConfig?.block_list;

    if (peerBlockList) {
      const peerBlacklistItemInfo = getBlacklistItemInfo(peerBlockList, 'Client');
      result = [...result, ...(peerBlacklistItemInfo || [])];
    }

    if (seedPeerBlockList) {
      const seedPeerBlacklistItemInfo = getBlacklistItemInfo(seedPeerBlockList, 'Seed Client');
      result = [...result, ...(seedPeerBlacklistItemInfo || [])];
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

      {/* ADD BLACKLIST button */}
      <Box sx={{ mt: 1, mb: 1.5 }}>
        <Button
          id="create-cluster"
          size="small"
          variant="outlined"
          disabled={isAllCombinationsUsed}
          sx={{
            borderColor: 'var(--palette-button-color)',
            color: 'var(--palette-label-text-color)',
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
