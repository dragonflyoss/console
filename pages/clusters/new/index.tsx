import Layout from 'components/layout';
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
} from '@mui/material';
import styles from './index.module.scss';
import { useState } from 'react';
import { createCluster } from 'lib/api';
import { useRouter } from 'next/router';
import HelpIcon from '@mui/icons-material/Help';
import { LoadingButton } from '@mui/lab';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import React from 'react';

const CreateCluster = () => {
  const CIDRsOptions = ['0.0.0.0/0', '10.0.0.0/8'];
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [nameError, setNameError] = useState(false);
  const [bioError, setbioError] = useState(false);
  const [SeedPeerloadlimitError, setSeedPeerloadlimitError] = useState(false);
  const [PeerloadlimitError, setPeerloadlimitError] = useState(false);
  const [NumberofconcurrentdownloadpiecesError, setNumberofconcurrentdownloadpiecesError] = useState(false);
  const [SchedulingparentlimitError, setSchedulingparentlimitError] = useState(false);
  const [ParentrangelimitError, setParentrangelimitError] = useState(false);
  const [LocationError, setLocationError] = useState(false);
  const [IDCError, setIDCError] = useState(false);
  const [CIDRsError, setCIDRsError] = useState(false);
  const [CIDRs, setCIDRs] = useState([]);
  const [editLoadingButton, setEditLoadingButton] = useState(false);
  const router = useRouter();

  const informationFormList = [
    {
      formProps: {
        id: 'name',
        label: 'Name',
        name: 'name',
        autoComplete: 'family-name',
        placeholder: 'Enter your name',
        helperText: nameError ? 'The length is 1-40' : '',
        error: nameError,

        onChange: (e: any) => {
          changeValidate(e.target.value, informationFormList[0]);
        },
      },
      syncError: false,
      setError: setNameError,

      validate: (value: string) => {
        const reg = /^[A-Za-z0-9-]{1,40}$/;
        return reg.test(value);
      },
      title: 'Cluster name.',
    },
    {
      formProps: {
        id: 'bio',
        label: 'Description',
        name: 'bio',
        autoComplete: 'family-name',
        placeholder: 'Enter a cluster description',
        helperText: bioError ? 'The length is 0-40' : '',
        error: bioError,

        onChange: (e: any) => {
          changeValidate(e.target.value, informationFormList[1]);
        },
      },
      syncError: false,
      setError: setbioError,

      validate: (value: string) => {
        const reg = /^[A-Za-z0-9]{0,1000}$/;
        return reg.test(value);
      },
      title: 'Cluster description.',
    },
  ];
  const scopesFormList = [
    {
      formProps: {
        id: 'Location',
        label: 'Location',
        name: 'Location',
        autoComplete: 'family-name',
        placeholder: 'Please enter Location',
        helperText: LocationError ? 'Maximum length is 100' : '',
        error: LocationError,

        onChange: (e: any) => {
          changeValidate(e.target.value, scopesFormList[0]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The cluster needs to serve all peers in the location. When the location in the peer configuration matches the location in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. It separated by "|", for example "area|country|province|city".`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.helpIcon} />
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
      formProps: {
        id: 'IDC',
        label: 'IDC',
        name: 'IDC',
        autoComplete: 'family-name',
        placeholder: 'Please enter IDC',
        helperText: IDCError ? 'Maximum length is 100' : '',
        error: IDCError,

        onChange: (e: any) => {
          changeValidate(e.target.value, scopesFormList[1]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.helpIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setIDCError,

      validate: (value: string) => {
        const reg = /^(.{0,100})$/;
        return reg.test(value);
      },
      title:
        'The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.',
    },
    {
      name: 'CIDRs',
      label: 'CIDRs',

      CIDRsFormProps: {
        value: CIDRs,
        options: CIDRsOptions,
        endAdornment: (
          <Tooltip
            title={
              'String	The cluster needs to serve all peers in the IDC. When the IDC in the peer configuration matches the IDC in the cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. IDC has higher priority than location in the scopes.'
            }
            placement="top"
          >
            <HelpIcon color="disabled" className={styles.helpIcon} />
          </Tooltip>
        ),

        onChange: (_e: any, newValue: any) => {
          if (!scopesFormList[2].formProps.error) {
            setCIDRs(newValue);
          }
        },

        onInputChange: (e: any) => {
          changeValidate(e.target.value, scopesFormList[2]);
        },

        renderTags: (value: any, getTagProps: any) =>
          value.map((option: any, index: any) => <Chip key={value} label={option} {...getTagProps({ index })} />),
      },

      formProps: {
        label: 'CIDRs',
        name: 'CIDRs',
        placeholder: 'Please enter CIDRs',
        error: CIDRsError,
        helperText: CIDRsError ? 'Length: (0, 100]' : '',

        onKeyDown: (e: any) => {
          if (e.keyCode === 13) {
            e.preventDefault();
          }
        },
      },

      syncError: false,
      setError: setCIDRsError,

      validate: (value: string) => {
        const reg = /^(.{0,1000})$/;
        return reg.test(value);
      },
      title:
        'The cluster needs to serve all peers in the CIDRs. The advertise IP will be reported in the peer configuration when the peer is started, and if the advertise IP is empty in the peer configuration, peer will automatically get expose IP as advertise IP. When advertise IP of the peer matches the CIDRs in cluster, the peer will preferentially use the scheduler and the seed peer of the cluster. CIDRs has higher priority than IDC in the scopes.',
    },
  ];

  const configFormList = [
    {
      formProps: {
        id: 'Seed Peer load limit',
        label: 'Seed Peer load limit',
        name: 'SeedPeerloadlimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Seed Peer load limit',
        defaultValue: 300,
        helperText: SeedPeerloadlimitError ? 'Must be a number and range from 0-5000' : '',
        error: SeedPeerloadlimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configFormList[0]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`If other peers download from the seed peer, the load of the seed peer will increase. When the load limit of the seed peer is reached, the scheduler will no longer schedule other peers to download from the seed peer until the it has the free load.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.helpIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setSeedPeerloadlimitError,

      validate: (value: string) => {
        const reg = /^\+?(\d|[1-4]\d{1,3}|[5-9]\d{1,2}|5000)(\.\d*)?$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'Peer load limit',
        label: 'Peer load limit',
        name: 'Peerloadlimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Peer load limit',
        defaultValue: 50,
        helperText: PeerloadlimitError ? 'Must be a number and range from 0-2000' : '',
        error: PeerloadlimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configFormList[1]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={
                'If other peers download from the peer, the load of the peer will increase. When the load limit of the peer is reached, the scheduler will no longer schedule other peers to download from the peer until the it has the free load.'
              }
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.helpIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setPeerloadlimitError,

      validate: (value: string) => {
        const reg = /^(?:[1-9]|[1-9][0-9]{1,2}|2000|0)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'Number of concurrent download pieces',
        label: 'Number of concurrent download pieces',
        name: 'concurrent_piece_count',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Number of concurrent download pieces',
        defaultValue: 4,
        helperText: NumberofconcurrentdownloadpiecesError ? 'Must be a number and range from 0-2000' : '',
        error: NumberofconcurrentdownloadpiecesError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configFormList[2]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The number of pieces that a peer can concurrent download from other peers.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.helpIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setNumberofconcurrentdownloadpiecesError,

      validate: (value: string) => {
        const reg = /^(?:[0-9]|[1-4][0-9]|50)$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'Candidate parent limit',
        label: 'Candidate parent limit',
        name: 'Candidateparentlimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Candidate parent limit',
        defaultValue: 4,
        helperText: SchedulingparentlimitError ? 'Must be a number and range from 0-20' : '',
        error: SchedulingparentlimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configFormList[3]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The maximum number of parents that the scheduler can schedule for download peer.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.helpIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setSchedulingparentlimitError,

      validate: (value: string) => {
        const reg = /^(0|[1-9]|1[0-9]|20)$/;
        return reg.test(value);
      },
      title: 'The maximum number of parents that the scheduler can schedule for download peer.',
    },
    {
      formProps: {
        id: 'Filter parent limit',
        label: 'Filter parent limit',
        name: 'Filterparentlimit',
        type: 'number',
        autoComplete: 'family-name',
        placeholder: 'Please enter Filter parent limit',
        defaultValue: 40,
        fullWidth: false,
        helperText: ParentrangelimitError ? 'Must be a number and range from 0-1000' : '',
        error: ParentrangelimitError,

        onChange: (e: any) => {
          changeValidate(e.target.value, configFormList[4]);
        },

        InputProps: {
          endAdornment: (
            <Tooltip
              title={`The scheduler will randomly select the  number of parents from all the parents according to the filter parent limit and evaluate the optimal parents in selecting parents for the peer to download task. The number of optimal parent is the scheduling parent limit.`}
              placement="top"
            >
              <HelpIcon color="disabled" className={styles.helpIcon} />
            </Tooltip>
          ),
        },
      },
      syncError: false,
      setError: setParentrangelimitError,

      validate: (value: string) => {
        const reg = /^(?:[0-9]|[1-9][0-9]{1,2}|1000)$/;
        return reg.test(value);
      },
    },
  ];

  const handleSubmit = async (event: any) => {
    setEditLoadingButton(true);
    event.preventDefault();
    const name = event.currentTarget.elements.name.value;
    const IsDefault = event.currentTarget.elements.IsDefault.checked;
    const bio = event.currentTarget.elements.bio.value;
    const Location = event.currentTarget.elements.Location.value;
    const IDC = event.currentTarget.elements.IDC.value;
    const SeedPeerloadlimit = event.currentTarget.elements.SeedPeerloadlimit.value;
    const Peerloadlimit = event.currentTarget.elements.Peerloadlimit.value;
    const concurrent_piece_count = event.currentTarget.elements.concurrent_piece_count.value;
    const CandidateParentLimit = event.currentTarget.elements.Candidateparentlimit.value;
    const FilterParentLimit = event.currentTarget.elements.Filterparentlimit.value;
    const data = new FormData(event.currentTarget);

    informationFormList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    scopesFormList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    configFormList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(
      !informationFormList.filter((item) => item.syncError).length &&
        !scopesFormList.filter((item) => item.syncError).length &&
        !configFormList.filter((item) => item.syncError).length,
    );

    if (canSubmit) {
      createCluster({
        name: String(name),
        peer_cluster_config: {
          concurrent_piece_count: Number(concurrent_piece_count),
          load_limit: Number(Peerloadlimit),
        },
        scheduler_cluster_config: {
          filter_parent_range_limit: Number(CandidateParentLimit),
          filter_parent_limit: Number(FilterParentLimit),
        },
        seed_peer_cluster_config: {
          load_limit: Number(SeedPeerloadlimit),
        },
        bio: String(bio),
        is_default: IsDefault,
        scopes: {
          cidrs: CIDRs,
          idc: String(IDC),
          location: String(Location),
        },
      }).then(async (response) => {
        if (response.status === 200) {
          setEditLoadingButton(false);
          setSuccessMessage(true);
          router.push('/clusters');
        } else {
          const responseMsg = await response.json();
          setErrorMessageText(responseMsg.message);
          setEditLoadingButton(false);
          setErrorMessage(true);
        }
      });
    } else {
      setEditLoadingButton(false);
    }
  };

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleClose = (_event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
  };

  return (
    <Grid className={styles.main}>
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
      <Snackbar
        open={errorMessage}
        autoHideDuration={3000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {errorMessageText}
        </Alert>
      </Snackbar>
      <Typography variant="h5" fontFamily="MabryPro-Bold">
        Create Cluster
      </Typography>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Grid className={styles.container} component="form" onSubmit={handleSubmit} noValidate>
        <Box className={styles.informationTitle}>
          <Typography variant="h6" fontFamily="MabryPro-Bold" mr="0.4rem">
            Information
          </Typography>
          <Tooltip title="The information of cluster." placement="top">
            <HelpIcon color="disabled" className={styles.helpIcon} />
          </Tooltip>
        </Box>
        <Box className={styles.isdefaultContainer}>
          <FormControlLabel
            control={<Checkbox defaultChecked sx={{ '&.MuiCheckbox-root': { color: '#1C293A' } }} />}
            label="Set cluster as your default cluster"
            name="IsDefault"
            sx={{ '&.MuiFormControlLabel-root': { mr: '0.6rem' } }}
          />
          <Tooltip
            title="When peer does not find a matching cluster based on scopes, the default cluster will be used."
            placement="top"
          >
            <HelpIcon color="disabled" className={styles.helpIcon} />
          </Tooltip>
        </Box>
        <Grid sx={{ display: 'flex' }}>
          {informationFormList.map((item) => (
            <TextField
              className={styles.TextField}
              color="success"
              size="small"
              key={item.formProps.name}
              {...item.formProps}
            />
          ))}
        </Grid>
        <Box className={styles.scopesTitle}>
          <Typography variant="h6" fontFamily="MabryPro-Bold" mr="0.4rem">
            Scopes
          </Typography>
          <Tooltip
            title="The cluster needs to serve the scope. It wil provide scheduler services and seed peer services to peers in
            the scope."
            placement="top"
          >
            <HelpIcon color="disabled" className={styles.helpIcon} />
          </Tooltip>
        </Box>
        <Grid sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {scopesFormList.map((item) => {
            return (
              <>
                {item.label === 'CIDRs' ? (
                  <Autocomplete
                    key={item.formProps.name}
                    freeSolo
                    multiple
                    {...item.CIDRsFormProps}
                    size="small"
                    className={styles.CIDRsIputer}
                    renderInput={(params) => <TextField {...params} color="success" {...item.formProps} />}
                  />
                ) : (
                  <TextField
                    size="small"
                    className={styles.TextField}
                    color="success"
                    key={item.formProps.name}
                    {...item.formProps}
                  />
                )}
              </>
            );
          })}
        </Grid>
        <Box className={styles.configTitle}>
          <Typography variant="h6" fontFamily="MabryPro-Bold" mr="0.4rem">
            Config
          </Typography>
          <Tooltip title=" The configuration for P2P downloads." placement="top">
            <HelpIcon color="disabled" className={styles.helpIcon} />
          </Tooltip>
        </Box>
        <Grid sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {configFormList.map((item) => (
            <TextField
              className={styles.TextField}
              color="success"
              size="small"
              key={item.formProps.name}
              {...item.formProps}
            />
          ))}
        </Grid>
        <Box className={styles.footerButton}>
          <LoadingButton
            loading={editLoadingButton}
            endIcon={<CancelIcon sx={{ color: '#1C293A' }} />}
            size="small"
            variant="outlined"
            loadingPosition="end"
            sx={{
              '&.MuiLoadingButton-root': {
                color: '#000000',
                borderRadius: 0,
                borderColor: '#979797',
              },
              ':hover': { backgroundColor: '#F4F3F6', borderColor: '#F4F3F6' },
              '&.MuiLoadingButton-loading': {
                backgroundColor: '#DEDEDE',
                color: '#000000',
                borderColor: '#DEDEDE',
              },
              mr: '1rem',
              width: '8rem',
            }}
            onClick={() => {
              setEditLoadingButton(true);

              router.push(`/clusters`);
            }}
          >
            Cancel
          </LoadingButton>
          <LoadingButton
            loading={editLoadingButton}
            endIcon={<CheckCircleIcon />}
            size="small"
            variant="outlined"
            type="submit"
            loadingPosition="end"
            sx={{
              '&.MuiLoadingButton-root': {
                backgroundColor: '#1C293A',
                borderRadius: 0,
                color: '#FFFFFF',
                borderColor: '#1C293A',
              },
              ':hover': { backgroundColor: '#555555', borderColor: '#555555' },
              '&.MuiLoadingButton-loading': {
                backgroundColor: '#DEDEDE',
                color: '#000000',
                borderColor: '#DEDEDE',
              },
              width: '8rem',
            }}
          >
            Save
          </LoadingButton>
        </Box>
      </Grid>
    </Grid>
  );
};

export default CreateCluster;
CreateCluster.getLayout = function getLayout(page: React.ReactElement) {
  return <Layout>{page}</Layout>;
};
