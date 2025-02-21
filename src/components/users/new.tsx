import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { SetStateAction, useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import {
  Alert,
  Backdrop,
  Box,
  Grid,
  InputAdornment,
  Snackbar,
  Link as RouterLink,
  Divider,
  styled,
  Breadcrumbs,
} from '@mui/material';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { matchIsValidTel, MuiTelInput } from 'mui-tel-input';
import styles from './new.module.css';
import { CancelLoadingButton, SavelLoadingButton } from '../loading-button';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import Card from '../card';
import { signUp } from '../../lib/api';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});
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
  const [phone, setPhone] = useState('');

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

  const handleChange = (newValue: string, data: any, cb?: () => void) => {
    setPhone(newValue);
    const { setError } = data;
    setError(
      !matchIsValidTel(newValue, {
        onlyCountries: ['FR', 'BE', 'CN', 'US', 'CA', 'JP', 'KR', 'TW', 'HK', 'MO', 'SG', 'MY', 'TH', 'VN'],
      }),
    );

    cb && cb();
  };

  const formList = [
    {
      formProps: {
        name: 'username',
        label: 'Account',
        autoComplete: 'family-name',
        id: 'account',
        required: true,
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
        placeholder: 'Enter your description',
        error: bioError,
        helperText: bioError ? 'Fill in the characters, the length is 0-1000.' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[2]);
        },
      },
      syncError: false,
      setError: setBioError,

      validate: (value: string) => {
        const reg = /^.{0,1000}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'phone',
        label: 'Phone',
        autoComplete: 'phone',
        id: 'phone',
        placeholder: 'Enter your phone',
        error: phoneError,
        helperText: phoneError ? 'Enter a valid phone number.' : '',
        value: phone,
        onChange: (newValue: any) => {
          handleChange(newValue, formList[3]);
        },
      },
      syncError: false,
      setError: setPhoneError,
    },
    {
      formProps: {
        name: 'location',
        label: 'Location',
        autoComplete: 'location',
        id: 'location',
        placeholder: 'Enter your location',
        error: locationError,
        helperText: locationError ? 'Fill in the characters, the length is 0-100.' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[4]);
        },
      },
      syncError: false,
      setError: setLocationError,

      validate: (value: string) => {
        const reg = /^[A-Za-z0-9]{0,100}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        name: 'password',
        label: 'Password',
        id: 'password',
        required: true,
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
          changeValidate(e.target.value, formList[5], () => {
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
        required: true,
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
          changeValidate(e.target.value, formList[6]);
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

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    const account = event.currentTarget.elements.account.value;
    const password = event.currentTarget.elements.password.value;
    const email = event.currentTarget.elements.email.value;
    const phone = event.currentTarget.elements.phone.value;
    const location = event.currentTarget.elements.location.value;
    const bio = event.currentTarget.elements.bio.value;

    const data = new FormData(event.currentTarget);

    formList.forEach((item) => {
      const value = data.get(item.formProps.name);

      if (item.validate) {
        item.setError(!item.validate(value as string));
        item.syncError = !item.validate(value as string);
      } else {
        item.setError(
          !matchIsValidTel(phone, {
            onlyCountries: ['FR', 'BE', 'CN', 'US', 'CA', 'JP', 'KR', 'TW', 'HK', 'MO', 'SG', 'MY', 'TH', 'VN'],
          }),
        );

        item.syncError = !matchIsValidTel(phone, {
          onlyCountries: ['FR', 'BE', 'CN', 'US', 'CA', 'JP', 'KR', 'TW', 'HK', 'MO', 'SG', 'MY', 'TH', 'VN'],
        });
      }
    });

    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length);

    if (canSubmit) {
      try {
        await signUp({
          name: account,
          password: password,
          email: email,
          bio: bio,
          phone: phone,
          location: location,
        });
        
        navigate(`/users`);
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    }
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
      <Typography variant="h5">Create a new user</Typography>
      <Breadcrumbs
        sx={{ m: '1rem 0' }}
        separator={
          <Box
            sx={{ width: '0.3rem', height: '0.3rem', backgroundColor: '#919EAB', borderRadius: '50%', m: '0 0.4rem' }}
          />
        }
        aria-label="breadcrumb"
      >
        <RouterLink component={Link} underline="hover" color="text.primary" to={`/users`}>
          User
        </RouterLink>
        <Typography color="inherit">New user</Typography>
      </Breadcrumbs>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: '2rem' }}>
        <Box className={styles.container}>
          <Card className={styles.uploadWrapper}>
            <IconButton
              component="label"
              tabIndex={-1}
              sx={{
                // display: 'flex',
                // alignItems: 'center',
                // flexDirection: 'column',
                // justifyContent: 'center',
                width: '10rem',
                height: '10rem',
                borderRadius: '50%',
                border: '1px dashed rgba(var(--no-data-color)/0.2)',
                padding: '0.5rem',
              }}
            >
              <VisuallyHiddenInput type="file" />
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  //   border: '1px dashed rgba(var(--no-data-color)/0.2)',
                  backgroundColor: 'rgba(var(--palette-grey-500Channel)/0.08)',
                }}
              >
                <CameraAltIcon />
                <Typography variant="body2" display="block" mt="0.5rem">
                  Upload photo
                </Typography>
              </Box>
            </IconButton>
            <Box className={styles.uploadText}>
              <Typography variant="body2" display="span">
                Allowed *.jpeg, *.jpg, *.png, *.gif
              </Typography>

              <Typography variant="body2" display="span">
                max size of 3 Mb
              </Typography>
            </Box>
          </Card>
          <Card className={styles.formData}>
            <Box className={styles.textFieldContainer}>
              {formList.map((item) =>
                item.formProps.id === 'phone' ? (
                  <MuiTelInput
                    defaultCountry="CN"
                    color="success"
                    size="small"
                    key={item.formProps.name}
                    {...item.formProps}
                    // value={phone}
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
            </Box>
            <Box className={styles.submitWrapper}>
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
          </Card>
        </Box>

        {/* <Divider sx={{ mt: 2, mb: 2 }} />
        <Box className={styles.form}>
          {formList.map((item) =>
            item.formProps.id === 'phone' ? (
              <MuiTelInput
                defaultCountry="CN"
                color="success"
                size="small"
                key={item.formProps.name}
                {...item.formProps}
                // value={phone}
                className={styles.input}
                fullWidth
              />
            ) : (
              <TextField
                color="success"
                size="small"
                key={item.formProps.name}
                className={styles.input}
                {...item.formProps}
                fullWidth
              />
            ),
          )}
        </Box>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Box sx={{ display: 'flex', mt: '2rem' }}>
          <CancelLoadingButton
            id="cancel"
            loading={loadingButton}
            onClick={() => {
              //   setLoadingButton(true);
              navigate(`/users`);
            }}
          />
          <SavelLoadingButton loading={loadingButton} endIcon={<CheckCircleIcon />} id="save" text="Save" />
        </Box> */}
      </Box>
    </Box>
  );
}
