import {
  Box,
  Typography,
  Divider,
  FormControl,
  TextField,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControlLabel,
  Checkbox,
  createTheme,
  ThemeProvider,
  Snackbar,
  Alert,
  Tooltip,
  FormGroup,
  InputLabel,
  Breadcrumbs,
  Link as RouterLink,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { formatDate, getExpiredTime } from '../../../lib/utils';
import { Link, useNavigate } from 'react-router-dom';
import { createTokens } from '../../../lib/api';
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MyContext } from '../../menu';
import { CancelLoadingButton, SavelLoadingButton } from '../../loading-button';

export default function CreateTokens() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [nameError, setNameError] = useState(false);
  const [bioError, setBioError] = useState(false);
  const [selectedTime, setSelectedTime] = useState('3650');
  const [expiredTime, setExpiredTime] = useState('');
  const [preheat, setPreheat] = useState(false);
  const [job, setJob] = useState(false);
  const [cluster, setCluster] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);

  const { user } = useContext(MyContext);

  const formList = [
    {
      formProps: {
        id: 'name',
        label: 'Name',
        name: 'name',
        required: true,
        autoComplete: 'family-name',
        placeholder: 'Enter your token name',
        helperText: nameError ? 'Fill in the characters, the length is 1-100.' : '',
        error: nameError,
        InputProps: {
          endAdornment: (
            <Tooltip title={`What’s this token for?`} placement="top">
              <HelpIcon
                sx={{
                  color: 'var(--palette-grey-300Channel)',
                  width: '0.8rem',
                  height: '0.8rem',
                  ':hover': { color: 'var(--palette--description-color)' },
                }}
              />
            </Tooltip>
          ),
        },

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
        },
      },
      syncError: false,
      setError: setNameError,

      validate: (value: string) => {
        const reg = /^(?=.*[A-Za-z0-9@$!%*?&._-])[A-Za-z0-9@$!%*?&._-]{1,100}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'bio',
        label: 'Description',
        name: 'bio',
        multiline: true,
        maxRows: 2,
        autoComplete: 'family-name',
        placeholder: 'Enter your description',
        helperText: bioError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: bioError,
        InputProps: {
          endAdornment: (
            <Tooltip title={'Personal access token description.'} placement="top">
              <HelpIcon
                sx={{
                  color: 'var(--palette-grey-300Channel)',
                  width: '0.8rem',
                  height: '0.8rem',
                  ':hover': { color: 'var(--palette--description-color)' },
                }}
              />
            </Tooltip>
          ),
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
        },
      },
      syncError: false,
      setError: setBioError,

      validate: (value: string) => {
        const reg = /^.{0,1000}$/;
        return reg.test(value);
      },
    },
  ];

  const navigate = useNavigate();

  useEffect(() => {
    const expiredTime = getExpiredTime(Number(3650));
    setExpiredTime(expiredTime);
  }, []);

  const changeValidate = (value: string, data: any) => {
    const { setError, validate } = data;
    setError(!validate(value));
  };

  const handleSelectExpiredTime = (event: SelectChangeEvent) => {
    setSelectedTime(event.target.value);

    const time = getExpiredTime(Number(event.target.value));
    setExpiredTime(time);
  };

  const handleSubmit = async (event: any) => {
    setLoadingButton(true);
    event.preventDefault();

    const name = event.currentTarget.elements.name;
    const bio = event.currentTarget.elements.bio;
    const scopes = [preheat ? 'preheat' : '', job ? 'job' : '', cluster ? 'cluster' : ''];
    const filteredScopes = scopes.filter((item) => item !== '');

    const data = new FormData(event.currentTarget);

    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const formData = {
      name: name.value,
      bio: bio.value,
      scopes: filteredScopes,
      expired_at: expiredTime,
      user_id: user.id,
    };

    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length);

    if (canSubmit) {
      try {
        const tokens = await createTokens({ ...formData });
        setLoadingButton(false);
        setSuccessMessage(true);

        const token = tokens.token;
        localStorage.setItem('token', JSON.stringify(token));
        navigate('/developer/personal-access-tokens');
      } catch (error) {
        if (error instanceof Error) {
          setLoadingButton(false);
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    } else {
      setLoadingButton(false);
    }
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
    setSuccessMessage(false);
  };

  return (
    <Box>
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
      <Typography variant="h5">Create personal access token</Typography>
      <Breadcrumbs
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
        sx={{ m: '1rem 0' }}
      >
        <Typography color="text.primary">Developer</Typography>
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/developer/personal-access-tokens`}>
          Personal access tokens
        </RouterLink>
        <Typography color="inherit">New token</Typography>
      </Breadcrumbs>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <FormControl fullWidth>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Information
            </Typography>
            <Tooltip title="  The information of personal access token." placement="top">
              <HelpIcon
                sx={{
                  color: 'var(--palette-grey-300Channel)',
                  width: '0.8rem',
                  height: '0.8rem',
                  ':hover': { color: 'var(--palette--description-color)' },
                }}
              />
            </Tooltip>
          </Box>
          {formList.map((item) => {
            return item?.formProps?.name === 'bio' ? (
              <TextField
                margin="normal"
                color="success"
                size="small"
                key={item.formProps.name}
                {...item.formProps}
                sx={{ width: '36rem' }}
              />
            ) : (
              <TextField
                margin="normal"
                color="success"
                size="small"
                key={item.formProps.name}
                {...item.formProps}
                sx={{ width: '18rem' }}
              />
            );
          })}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '1.4rem', mt: '1rem' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Expiration
            </Typography>
            <Tooltip title="Expiration of personal access token." placement="top">
              <HelpIcon
                sx={{
                  color: 'var(--palette-grey-300Channel)',
                  width: '0.8rem',
                  height: '0.8rem',
                  ':hover': { color: 'var(--palette--description-color)' },
                }}
              />
            </Tooltip>
          </Box>
          <FormControl size="small">
            <InputLabel required id="demo-simple-select-label">
              Expiration
            </InputLabel>
            <Box display="flex" alignItems="center">
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={selectedTime}
                label="Expiration"
                onChange={handleSelectExpiredTime}
                sx={{
                  width: '10rem',
                }}
              >
                <MenuItem value={7}>7 days</MenuItem>
                <MenuItem value={30}>30 days</MenuItem>
                <MenuItem value={60}>60 days</MenuItem>
                <MenuItem value={90}>90 days</MenuItem>
                <MenuItem value={'3650'}>10 years</MenuItem>
              </Select>
              <Typography variant="body2" color="text.primary" ml="1rem">
                The token expires on {formatDate(expiredTime) || ''}.
              </Typography>
            </Box>
          </FormControl>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '0.8rem', mt: '1rem' }}>
            <Typography variant="h6" fontFamily="mabry-bold" mr="0.4rem">
              Select scopes
            </Typography>
            <Tooltip title="Scopes define the access for personal tokens." placement="top">
              <HelpIcon
                sx={{
                  color: 'var(--palette-grey-300Channel)',
                  width: '0.8rem',
                  height: '0.8rem',
                  ':hover': { color: 'var(--palette--description-color)' },
                }}
              />
            </Tooltip>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
            <FormGroup>
              <Box display="flex" alignItems="center">
                <Box width="10%">
                  <FormControlLabel
                    label="preheat"
                    control={
                      <Checkbox
                        checked={preheat}
                        onChange={(event: any) => {
                          setPreheat(event.target.checked);
                        }}
                        sx={{ color: 'var(--palette--button-color)!important' }}
                      />
                    }
                  />
                </Box>
                <Typography variant="body2" color="var(--palette--text-palette-text-secondary)" ml="1rem">
                  Full control of preheating, it's used for preheating of harbor.
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Box width="10%">
                  <FormControlLabel
                    label="job"
                    control={
                      <Checkbox
                        checked={job}
                        onChange={(event: any) => {
                          setJob(event.target.checked);
                        }}
                        sx={{ color: 'var(--palette--button-color)!important' }}
                      />
                    }
                  />
                </Box>
                <Typography variant="body2" color="var(--palette--text-palette-text-secondary)" ml="1rem">
                  Full control of job. If you need to call preheat job through open API, it is recommended to use
                  preheat job.
                </Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Box width="10%">
                  <FormControlLabel
                    label="cluster"
                    control={
                      <Checkbox
                        checked={cluster}
                        onChange={(event: any) => {
                          setCluster(event.target.checked);
                        }}
                        sx={{ color: 'var(--palette--button-color)!important' }}
                      />
                    }
                  />
                </Box>
                <Typography variant="body2" color="var(--palette--text-palette-text-secondary)" ml="1rem">
                  Full control of cluster.
                </Typography>
              </Box>
            </FormGroup>
          </Box>
          <Divider sx={{ mt: '1.5rem', mb: '2rem' }} />
          <Box>
            <CancelLoadingButton
              id="cancel"
              loading={loadingButton}
              onClick={() => {
                navigate('/developer/personal-access-tokens');
              }}
            />
            <SavelLoadingButton loading={loadingButton} endIcon={<CheckCircleIcon />} id="save" text="Save" />
          </Box>
        </FormControl>
      </Box>
    </Box>
  );
}
