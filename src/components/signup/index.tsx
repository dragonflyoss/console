import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { useEffect, useState } from 'react';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { Alert, Backdrop, Box, Grid, InputAdornment, Snackbar, Link as RouterLink } from '@mui/material';
import Rotation from '../rotation';
import { signUp } from '../../lib/api';
import styles from './index.module.css';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { setPageTitle } from '../../lib/utils';
import { ReactComponent as Login } from '../../assets/images/login/login.svg';
import { ReactComponent as PageLoading } from '../../assets/images/login/page-loading.svg';
import { DarkMode } from '../dark-layout';
import ErrorHandler from '../error-handler';

export default function SignUp() {
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [accountError, setAccountError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPassworError, setConfirmPassworError] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoding, setPageLoding] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

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
              {showPassword ? <Visibility id="visibility" /> : <VisibilityOff id="visibility-off" />}
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
                {showConfirmPassword ? (
                  <Visibility id="confirm-password-visibility" />
                ) : (
                  <VisibilityOff id="confirm-password-visibility-off" />
                )}
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

  useEffect(() => {
    setPageTitle(location.pathname);
  }, [location]);

  const handlePassword = (type: 'password' | 'confirmPassword') => {
    if (type === 'password') {
      setShowPassword((show) => !show);
    } else {
      setShowConfirmPassword((show) => !show);
    }
  };

  const changeValidate = (value: string, data: any, cb?: () => void) => {
    const { setError, validate } = data;
    setError(!validate(value));
    cb && cb();
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const accountElement = event.currentTarget.elements.username;
    const emailElement = event.currentTarget.elements.email;
    const passwordElement = event.currentTarget.elements.password;

    const data = new FormData(event.currentTarget);
    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length);
    if (canSubmit) {
      try {
        await signUp({
          name: accountElement.value,
          password: passwordElement.value,
          email: emailElement.value,
        });

        setPageLoding(true);
        navigate('/signin');
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
        }
      }
    }
  };

  const handleClose = (_: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setErrorMessage(false);
  };

  return (
    <Grid container className={styles.page}>
      <ErrorHandler errorMessage={errorMessage} errorMessageText={errorMessageText} onClose={handleClose} />
      <Backdrop
        open={pageLoding}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0,0,0,0.3)',
        }}
      >
        <PageLoading className={styles.pageLoading} />
      </Backdrop>
      <Grid size={6}>
        <Rotation />
      </Grid>
      <Grid size={6} className={styles.container}>
        <DarkMode className={styles.header} />
        <Container component="main" maxWidth="xs">
          <Box
            sx={{
              mt: '5rem',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Login className={styles.logo} />
            <Typography variant="h5" gutterBottom>
              Registered Account
            </Typography>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: '1rem' }}>
              <Grid container spacing={3}>
                {formList.map((item) => (
                  <Grid key={item.formProps.name} size={12}>
                    <TextField required fullWidth color="success" {...item.formProps} />
                  </Grid>
                ))}
              </Grid>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: '1.4rem',
                  background: 'var(--palette-description-color)',
                  color: 'var(--palette-button-text-color)',
                  ':hover': { backgroundColor: 'var(--palette-sign-hover-button-text-color)' },
                }}
              >
                <Typography variant="button">Sign Up</Typography>
              </Button>
              <Box className={styles.separationLineContainer}>
                <Typography component="span" className={styles.separationLine}></Typography>
                <Typography component="span" className={styles.text}>
                  or
                </Typography>
                <Typography component="span" className={styles.separationLine}></Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Grid>
                  <Typography component="span">Already have an account?</Typography>
                  <RouterLink
                    id="sign-in"
                    underline="hover"
                    component={Link}
                    to="/signin"
                    onClick={() => {
                      setPageLoding(true);
                    }}
                    sx={{ color: '#2E8F79', ml: '0.4rem' }}
                  >
                    <Typography component="span">Sign in</Typography>
                  </RouterLink>
                </Grid>
              </Box>
            </Box>
          </Box>
        </Container>
      </Grid>
    </Grid>
  );
}
