import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { SetStateAction, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { Alert, Backdrop, Box, Grid, InputAdornment, Snackbar, Link as RouterLink, Divider } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { matchIsValidTel, MuiTelInput } from 'mui-tel-input';
import styles from './new.module.css';
import { CancelLoadingButton, SavelLoadingButton } from '../loading-button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function NewUser() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [accountError, setAccountError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [bioError, setBioError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPassworError, setConfirmPassworError] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loadingButton, setLoadingButton] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [value, setValue] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const changeValidate = (value: string, data: any, cb?: () => void) => {
    const { setError, validate } = data;
    setError(!validate(value));
    cb && cb();
  };

  const handlePassword = (type: 'password' | 'confirmPassword') => {
    if (type === 'password') {
      setShowPassword((show) => !show);
    } else {
      setShowConfirmPassword((show) => !show);
    }
  };
  const handleChange = (newValue: string) => {
    matchIsValidTel(newValue, {
      onlyCountries: [], // optional,
      excludedCountries: [], // optional
      continents: [], // optional
    }); // true | false

    setValue(newValue);
  };

  const formList = [
    {
      formProps: {
        name: 'username',
        label: 'Account',
        autoComplete: 'family-name',
        id: 'account',
        placeholder: 'Enter your account',
        error: accountError,
        helperText: accountError ? 'Fill in the characters, the length is 3-10.' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
        },
      },
      syncError: false,
      setError: setAccountError,

      validate: (value: string) => {
        const reg = /^(?=.*[A-Za-z0-9@$!%*?&._-])[A-Za-z0-9@$!%*?&._-]{3,10}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'email',
        label: 'Email',
        autoComplete: 'email',
        id: 'email',
        placeholder: 'Enter your email',
        error: emailError,
        helperText: emailError ? 'Email is invalid or already taken.' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
        },
      },
      syncError: false,
      setError: setEmailError,

      validate: (value: string) => {
        const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'bio',
        label: 'Description',
        autoComplete: 'bio',
        id: 'bio',
        placeholder: 'Enter your email',
        error: bioError,
        helperText: bioError ? 'Email is invalid or already taken.' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[2]);
        },
      },
      syncError: false,
      setError: setBioError,

      validate: (value: string) => {
        const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'Phone',
        label: 'phone',
        autoComplete: 'phone',
        id: 'phone',
        placeholder: 'Enter your phone',
        error: phoneError,
        helperText: phoneError ? 'Phone is invalid or already taken.' : '',
        value: { value },
        // defaultCountry: 'FR',
        onChange: (newValue: any) => {
          //   changeValidate(e.target.value, formList[1]);

          setValue(newValue);
        },
      },
      syncError: false,
      setError: setPhoneError,

      validate: (value: string) => {
        const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'location',
        label: 'Location',
        autoComplete: 'location',
        id: 'location',
        placeholder: 'Enter your location',
        error: locationError,
        helperText: locationError ? 'Email is invalid or already taken.' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
        },
      },
      syncError: false,
      setError: setLocationError,

      validate: (value: string) => {
        const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'password',
        label: 'Password',
        id: 'password',
        placeholder: 'Enter your password',
        autoComplete: 'new-password',
        helperText: passwordError ? `At least 8-16 characters, with at least 1 lowercase letter and 1 number.` : '',
        type: showPassword ? 'text' : 'password',
        error: passwordError,
        InputProps: {
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('password');
              }}
              edge="end"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        },

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[2], () => {
            setPassword(e.target.value);
          });
        },
      },
      syncError: false,
      setError: setPasswordError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'confirmPassword',
        label: 'ConfirmPassword',
        id: 'confirmPassword',
        type: showConfirmPassword ? 'text' : 'password',
        autoComplete: 'new-password',
        placeholder: 'Repeat your new password',
        error: confirmPassworError,
        helperText: confirmPassworError ? 'Please enter the same password.' : '',

        InputProps: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={() => {
                  handlePassword('confirmPassword');
                }}
                edge="end"
              >
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          ),
        },

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[3]);
        },
      },

      syncError: false,
      setError: setConfirmPassworError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return value === password && reg.test(value);
      },
    },
  ];

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
  };

  const handleSubmit = () => {};
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
      <Typography variant="h5">Create User</Typography>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: '1rem' }}>
        <Grid sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {formList.map((item) =>
            item.formProps.id === 'phone' ? (
              <MuiTelInput
                defaultCountry="CN"
                color="success"
                size="small"
                key={item.formProps.name}
                {...item.formProps}
                value={value}
                className={styles.textField}
              />
            ) : (
              <TextField
                color="success"
                size="small"
                key={item.formProps.name}
                className={styles.textField}
                {...item.formProps}
              />
            ),
          )}
        </Grid>
        <Divider sx={{ mt: '1rem', mb: '2rem' }} />
        <Box>
          <CancelLoadingButton
            id="cancel"
            loading={loadingButton}
            onClick={() => {
              //   setLoadingButton(true);
              navigate(`/users`);
            }}
          />
          <SavelLoadingButton loading={loadingButton} endIcon={<CheckCircleIcon />} id="save" text="Save" />
        </Box>
      </Box>
    </Box>
  );
}
