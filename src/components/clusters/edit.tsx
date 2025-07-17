import {
  Alert,
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
  Skeleton,
  Breadcrumbs,
  Link as RouterLink,
} from '@mui/material';
import styles from './edit.module.css';
import HelpIcon from '@mui/icons-material/Help';
import { useEffect, useState } from 'react';
import { getCluster, updateCluster, getClusterResponse } from '../../lib/api';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CancelLoadingButton, SavelLoadingButton } from '../loading-button';
import Card from '../card';
import { ReactComponent as Information } from '../../assets/images/cluster/information-cluster.svg';
import ErrorHandler from '../error-handler';

export default function EditCluster() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [bioError, setBioError] = useState(false);
  const [seedPeerLoadLimitError, setSeedPeerLoadLimitError] = useState(false);
  const [peerLoadLimitError, setPeerLoadLimitError] = useState(false);
  const [candidateParentLimitError, setCandidateParentLimitError] = useState(false);
  const [filterParentLimitError, setFilterParentLimitError] = useState(false);
  const [jobRateLimitError, setJobRateLimit] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [idcError, setIDCError] = useState(false);
  const [cidrsError, setCIDRsError] = useState(false);
  const [hostnamesError, setHostnamesError] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const cidrsOptions = ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16'];
  const [idcHelperText, setIDCHelperText] = useState('Fill in the characters, the length is 0-100.');
  const [cidrsHelperText, setCIDRsHelperText] = useState('Fill in the characters, the length is 0-400.');
  const [hostnamesHelperText, setHostnamesHelperText] = useState('Fill in the characters, the length is 1-30.');
  const [cluster, setCluster] = useState<getClusterResponse>({
    id: 0,
    name: '',
    bio: '',
    scopes: {
      idc: '',
      location: '',
      cidrs: [],
      hostnames: [],
    },
    scheduler_cluster_id: 0,
    seed_peer_cluster_id: 0,
    scheduler_cluster_config: {
      candidate_parent_limit: 0,
      filter_parent_limit: 0,
      job_rate_limit: 0,
    },
    seed_peer_cluster_config: {
      load_limit: 0,
    },
    peer_cluster_config: {
      load_limit: 0,
    },
    created_at: '',
    updated_at: '',
    is_default: false,
  });
  const navigate = useNavigate();
  const params = useParams();

  const {
    bio,
    is_default,
    id,
    peer_cluster_config: { load_limit },
    scheduler_cluster_config: { candidate_parent_limit, filter_parent_limit, job_rate_limit },
    scopes: { idc, location, cidrs, hostnames },
    seed_peer_cluster_config,
  } = cluster;

  useEffect(() => {
    (async function () {
      try {
        setIsLoading(true);

        if (typeof params.id === 'string') {
          const cluster = await getCluster(params.id);
          setCluster(cluster);
          setIsLoading(false);
        }
      } catch (error) {
        if (error instanceof Error) {
          setIsLoading(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    })();
  }, [params.id]);

  const informationForm = [
    {
      formProps: {
        id: 'description',
        label: 'Description',
        name: 'description',
        multiline: true,
        maxRows: 2,
        autoComplete: 'family-name',
        value: bio,
        placeholder: 'Please enter description',
        helperText: bioError ? 'Fill in the characters, the length is 0-400.' : '',
        error: bioError,

        onChange: (e: any) => {
          setCluster({ ...cluster, bio: e.target.value });
          changeValidate(e.target.value, informationForm[0]);
        },
      },
      syncError: false,
      setError: setBioError,

      validate: (value: string) => {
        const reg = /^.{0,400}$/;
        return reg.test(value);
      },
    },
  ];

  const scopesForm = [
    {
      formProps: {
        id: 'location',
        label: 'Location',
        name: 'location',
        autoComplete: 'family-name',
        placeholder: 'Please enter Location',
        value: location,
        helperText: locationError ? 'Fill in the characters, the length is 0-100.' : '',
        error: locationError,

        onChange: (e: any) => {
          setCluster({ ...cluster, scopes: { ...cluster.scopes, location: e.target.value } });
          changeValidate(e.target.value, scopesForm[0]);
        },
        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'The cluster needs to serve all peers in the location. When the location in the peer configuration matches the location in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. It separated by "|", for example "area|country|province|city".'
              }
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setLocationError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
    },
    {
      enterMultiple: true,
      scopesFormProps: {
        id: 'idc',
        name: 'idc',
        label: 'IDC',
        value: (idc && idc?.split('|')) || [],
        options: [],

        onChange: (_e: any, newValue: any) => {
          if (!scopesForm[1].formProps.error) {
            setCluster({ ...cluster, scopes: { ...cluster.scopes, idc: newValue.join('|') } });
          }
        },

        onInputChange: (e: any) => {
          setIDCHelperText('Fill in the characters, the length is 0-100.');
          changeValidate(e.target.value, scopesForm[1]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip id={`idc-${index}`} size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },
      formProps: {
        id: 'idc',
        label: 'IDC',
        name: 'idc',
        placeholder: 'Please enter IDC',
        error: idcError,
        helperText: idcError ? idcHelperText : '',
        endadornment: (
          <Tooltip
            title={`The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.`}
            placement="top"
          >
            <HelpIcon
              sx={{
                color: 'var(--palette-grey-300Channel)',
                width: '0.8rem',
                height: '0.8rem',
                mr: '0.3rem',
                ':hover': { color: 'var(--palette-description-color)' },
              }}
            />
          </Tooltip>
        ),
        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },
      syncError: false,
      setError: setIDCError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
    },
    {
      enterMultiple: true,
      scopesFormProps: {
        id: 'cidrs',
        name: 'cidrs',
        label: 'CIDRs',
        value: cidrs || [],
        options: cidrsOptions,

        onChange: (_e: any, newValue: any) => {
          if (!scopesForm[2].formProps.error) {
            setCluster({ ...cluster, scopes: { ...cluster.scopes, cidrs: newValue } });
          }
        },

        onInputChange: (e: any) => {
          setIDCHelperText('Fill in the characters, the length is 0-400.');
          changeValidate(e.target.value, scopesForm[2]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip id={`cidrs-${index}`} size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },
      formProps: {
        id: 'cidrs',
        label: 'CIDRs',
        name: 'cidrs',
        placeholder: 'Please enter CIDRs',
        error: cidrsError,
        helperText: cidrsError ? cidrsHelperText : '',
        endadornment: (
          <Tooltip
            title={
              'The cluster needs to serve all peers in the CIDRs. The advertise IP will be reported in the peer configuration when the peer is started, and if the advertise IP is empty in the peer configuration, peer will automatically get expose IP as advertise IP. When advertise IP of the peer matches the CIDRs in cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. CIDRs has higher priority than IDC in the scopes. CIDRs has higher priority than IDC in the scopes. CIDRs has priority equal to hostname in the scopes.'
            }
            placement="top"
          >
            <HelpIcon
              sx={{
                color: 'var(--palette-grey-300Channel)',
                width: '0.8rem',
                height: '0.8rem',
                mr: '0.3rem',
                ':hover': { color: 'var(--palette-description-color)' },
              }}
            />
          </Tooltip>
        ),
        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },
      syncError: false,
      setError: setCIDRsError,

      validate: (value: string) => {
        const reg = /^(.{0,400})$/;
        return reg.test(value);
      },
    },
    {
      enterMultiple: true,
      scopesFormProps: {
        id: 'hostnames',
        name: 'hostnames',
        label: 'Hostnames',
        value: hostnames || [],
        options: [],

        onChange: (_e: any, newValue: any) => {
          if (!scopesForm[3].formProps.error) {
            setCluster({ ...cluster, scopes: { ...cluster.scopes, hostnames: newValue } });
          }
        },

        onInputChange: (e: any) => {
          setHostnamesHelperText('Fill in the characters, the length is 0-400.');
          changeValidate(e.target.value, scopesForm[3]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => (
            <Chip id={`hostnames-${index}`} size="small" key={index} label={option} {...getTagProps({ index })} />
          )),
      },

      formProps: {
        id: 'hostnames',
        label: 'Hostnames',
        name: 'hostnames',
        placeholder: 'Please enter Hostnames',
        error: hostnamesError,
        helperText: hostnamesError ? hostnamesHelperText : '',
        endadornment: (
          <Tooltip
            title={
              'The cluster needs to serve all peers in hostname. The input parameter is the multiple hostname regexes. The hostname will be reported in the peer configuration when the peer is started. When the hostname matches the multiple hostname regexes in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. Hostname has higher priority than IDC in the scopes. Hostname has priority equal to CIDRs in the scopes.'
            }
            placement="top"
          >
            <HelpIcon
              sx={{
                color: 'var(--palette-grey-300Channel)',
                width: '0.8rem',
                height: '0.8rem',
                mr: '0.3rem',
                ':hover': { color: 'var(--palette-description-color)' },
              }}
            />
          </Tooltip>
        ),
        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setHostnamesError,

      validate: (value: string) => {
        const reg = /^(.{1,30})$/;
        return reg.test(value);
      },
    },
  ];

  const configForm = [
    {
      formProps: {
        id: 'seedPeerLoadLimit',
        label: 'Seed Peer load limit',
        name: 'seedPeerLoadLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Seed Peer load limit',
        value: seed_peer_cluster_config?.load_limit,
        helperText: seedPeerLoadLimitError ? 'Fill in the number, the length is 0-50000.' : '',
        error: seedPeerLoadLimitError,

        onChange: (e: any) => {
          setCluster({
            ...cluster,
            seed_peer_cluster_config: { ...cluster.seed_peer_cluster_config, load_limit: e.target.value },
          });
          changeValidate(e.target.value, configForm[0]);
        },
        InputProps: {
          endAdornment: (
            <Tooltip
              title={`If other peers download from the seed peer, the load of the seed peer will increase. When the load limit of the seed peer is reached, the scheduler will no longer schedule other peers to download from the seed peer until the it has the free load.`}
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setSeedPeerLoadLimitError,

      validate: (value: string) => {
        const reg = /^(?:[0-9]|[1-9][0-9]{1,3}|[1-4][0-9]{4}|50000)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'peerLoadLimit',
        label: 'Peer load limit',
        name: 'peerLoadLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Peer load limit',
        helperText: peerLoadLimitError ? 'Fill in the number, the length is 0-2000.' : '',
        error: peerLoadLimitError,
        value: load_limit,

        onChange: (e: any) => {
          setCluster({
            ...cluster,
            peer_cluster_config: { ...cluster.peer_cluster_config, load_limit: e.target.value },
          });
          changeValidate(e.target.value, configForm[1]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'If other peers download from the peer, the load of the peer will increase. When the load limit of the peer is reached, the scheduler will no longer schedule other peers to download from the peer until the it has the free load.'
              }
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setPeerLoadLimitError,
      validate: (value: string) => {
        const reg = /^0*1\d{3}$|2000|^0*[1-9]\d{0,2}$|^0*$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'candidateParentLimit',
        label: 'Candidate parent limit',
        name: 'candidateParentLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Candidate parent limit',
        value: candidate_parent_limit,
        helperText: candidateParentLimitError ? 'Fill in the number, the length is 1-20.' : '',
        error: candidateParentLimitError,

        onChange: (e: any) => {
          setCluster({
            ...cluster,
            scheduler_cluster_config: {
              ...cluster.scheduler_cluster_config,
              candidate_parent_limit: e.target.value,
            },
          });
          changeValidate(e.target.value, configForm[2]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The maximum number of parents that the scheduler can schedule for download peer.`}
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setCandidateParentLimitError,

      validate: (value: string) => {
        const reg = /^([1-9]|1[0-9]|20)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'filterParentLimit',
        label: 'Filter parent limit',
        name: 'filterParentLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Filter parent limit',
        value: filter_parent_limit,
        helperText: filterParentLimitError ? 'Fill in the number, the length is 10-1000.' : '',
        error: filterParentLimitError,

        onChange: (e: any) => {
          setCluster({
            ...cluster,
            scheduler_cluster_config: {
              ...cluster.scheduler_cluster_config,
              filter_parent_limit: e.target.value,
            },
          });
          changeValidate(e.target.value, configForm[3]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The scheduler will randomly select the  number of parents from all the parents according to the filter parent limit and evaluate the optimal parents in selecting parents for the peer to download task. The number of optimal parent is the scheduling parent limit.`}
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setFilterParentLimitError,
      validate: (value: string) => {
        const reg = /^([1-9][0-9]{1,2}|1000)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'jobRateLimit',
        label: 'Job Rate Limit',
        name: 'jobRateLimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Job Rate Limit',
        value: job_rate_limit,
        helperText: jobRateLimitError ? 'Fill in the number, the length is 1-1000000.' : '',
        error: jobRateLimitError,

        onChange: (e: any) => {
          setCluster({
            ...cluster,
            scheduler_cluster_config: {
              ...cluster.scheduler_cluster_config,
              job_rate_limit: e.target.value,
            },
          });
          changeValidate(e.target.value, configForm[4]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The rate limit(requests per second) for job Open API, default value is 10.`}
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setJobRateLimit,
      validate: (value: string) => {
        const reg = /^(?:[1-9][0-9]{0,5}|1000000)$/;
        return reg.test(value);
      },
    },
  ];

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const idcText = event.currentTarget.elements.idc.value;
    const cidrsText = event.currentTarget.elements.cidrs.value;
    const hostnamesText = event.currentTarget.elements.hostnames.value;

    if (idcText) {
      setIDCHelperText('Please press ENTER to end the IDC creation.');
      setIDCError(true);
    } else {
      setIDCError(false);
      setIDCHelperText('Fill in the characters, the length is 0-100.');
    }

    if (cidrsText) {
      setCIDRsHelperText('Please press ENTER to end the CIDRs creation.');
      setCIDRsError(true);
    } else {
      setCIDRsError(false);
      setCIDRsHelperText('Fill in the characters, the length is 0-100.');
    }

    if (hostnamesText) {
      setHostnamesHelperText('Please press ENTER to end the Hostnames creation.');
      setHostnamesError(true);
    } else {
      setHostnamesError(false);
      setHostnamesHelperText('Fill in the characters, the length is 1-30.');
    }

    informationForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    configForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    scopesForm.forEach((item) => {
      if (item.formProps.name === 'location') {
        const value = data.get(item.formProps.name);
        item.setError(!item.validate(value as string));
        item.syncError = !item.validate(value as string);
      }
    });

    const canSubmit = Boolean(
      !informationForm.filter((item) => item.syncError).length &&
        !scopesForm.filter((item) => item.syncError).length &&
        !configForm.filter((item) => item.syncError).length &&
        Boolean(!idcText) &&
        Boolean(!cidrsText) &&
        Boolean(!hostnamesText),
    );

    const formdata = {
      is_default: is_default,
      bio: String(bio),
      peer_cluster_config: {
        load_limit: Number(load_limit),
      },
      scheduler_cluster_config: {
        candidate_parent_limit: Number(candidate_parent_limit),
        filter_parent_limit: Number(filter_parent_limit),
        job_rate_limit: Number(job_rate_limit),
      },
      scopes: {
        cidrs: cidrs || [],
        idc: String(idc),
        location: String(location),
        hostnames: hostnames || [],
      },
      seed_peer_cluster_config: {
        load_limit: Number(seed_peer_cluster_config.load_limit),
      },
    };

    if (canSubmit && typeof params.id === 'string') {
      try {
        await updateCluster(params.id, { ...formdata });
        setLoadingButton(false);
        setSuccessMessage(true);
        navigate(`/clusters/${params.id}`);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setLoadingButton(false);
        }
      }
    } else {
      setLoadingButton(false);
    }
  };

  return (
    <Grid>
      <Snackbar
        open={successMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Submission successful!
        </Alert>
      </Snackbar>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Typography variant="h5">Update Cluster</Typography>
      <Breadcrumbs
        separator={<Box className={styles.breadcrumbs} />}
        aria-label="breadcrumb"
        sx={{ mb: '2rem', mt: '1rem' }}
      >
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/clusters`}>
          Cluster
        </RouterLink>
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/clusters/${params.id}`}>
          {cluster?.name}
        </RouterLink>
        <Typography color="inherit">Edit cluster</Typography>
      </Breadcrumbs>
      <Divider sx={{ mt: '1rem', mb: '1rem' }} />
      <Card className={styles.header}>
        <Information className={styles.informationIcon} />
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography component="span" variant="body1" fontFamily="mabry-bold">
              ID:&nbsp;&nbsp;
            </Typography>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '2rem' }} />
            ) : (
              <Typography id="id" component="div" variant="body1" fontFamily="mabry-bold">
                {cluster.id}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography component="span" variant="body1" fontFamily="mabry-bold">
              Name:&nbsp;&nbsp;
            </Typography>
            {isLoading ? (
              <Skeleton data-testid="isloading" sx={{ width: '4rem' }} />
            ) : (
              <Typography id="name" component="div" variant="body1" fontFamily="mabry-bold">
                {cluster.name}
              </Typography>
            )}
          </Box>
        </Box>
      </Card>
      <Grid component="form" noValidate onSubmit={handleSubmit}>
        <Box className={styles.container}>
          <Box className={styles.titelContainer}>
            <Typography variant="h6" className={styles.titleText}>
              Information
            </Typography>
            <Tooltip title="The information of cluster." placement="top">
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          <Box className={styles.defaultContainer}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={is_default}
                  onChange={(event: { target: { checked: any } }) => {
                    setCluster({ ...cluster, is_default: event.target.checked });
                  }}
                  id="default"
                  sx={{ '&.MuiCheckbox-root': { color: 'var(--palette-button-color)' } }}
                />
              }
              label="Set cluster as your default cluster"
              name="IsDefault"
              sx={{ '&.MuiFormControlLabel-root': { mr: '0.6rem' } }}
            />
            <Tooltip
              title="When peer does not find a matching cluster based on scopes, the default cluster will be used."
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          {informationForm.map((item) => (
            <TextField
              size="small"
              color="success"
              key={item.formProps.name}
              {...item.formProps}
              className={styles.idcInput}
            />
          ))}
          <Box className={styles.titelContainer}>
            <Typography variant="h6" className={styles.titleText}>
              Scopes
            </Typography>
            <Tooltip
              title="The cluster needs to serve the scope. It wil provide scheduler services and seed peer services to peers in
            the scope."
              placement="top"
            >
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          <Grid className={styles.scopesContainer}>
            {scopesForm.map((item) => {
              return (
                <Box key={item.formProps.name}>
                  {item.enterMultiple ? (
                    <Autocomplete
                      freeSolo
                      multiple
                      disableClearable
                      {...item.scopesFormProps}
                      size="small"
                      className={styles.cidrsInput}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          InputProps={{
                            ...params.InputProps,
                            endAdornment: item.formProps.endadornment,
                          }}
                          color="success"
                          {...item.formProps}
                        />
                      )}
                    />
                  ) : (
                    <TextField size="small" className={styles.textField} color="success" {...item.formProps} />
                  )}
                </Box>
              );
            })}
          </Grid>
          <Box className={styles.titelContainer}>
            <Typography variant="h6" className={styles.titleText}>
              Config
            </Typography>
            <Tooltip title=" The configuration for P2P downloads." placement="top">
              <HelpIcon className={styles.descriptionIcon} />
            </Tooltip>
          </Box>
          <Grid className={styles.configContainer}>
            {configForm.map((item) => (
              <TextField
                size="small"
                className={styles.textField}
                color="success"
                required
                inputProps={{
                  min: 0,
                }}
                key={item.formProps.name}
                {...item.formProps}
              />
            ))}
          </Grid>
        </Box>
        <Divider sx={{ mt: '1rem', mb: '2rem' }} />
        <Box>
          <CancelLoadingButton
            id="cancel"
            loading={loadingButton}
            onClick={() => {
              setLoadingButton(true);
              navigate(`/clusters/${params.id}`);
            }}
          />
          <SavelLoadingButton loading={loadingButton} endIcon={<CheckCircleIcon />} id="save" text="Save" />
        </Box>
      </Grid>
    </Grid>
  );
}
