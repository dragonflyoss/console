import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { InputAdornment } from '@mui/material';
import Rotation from 'components/rotation';
import { signUp } from 'lib/api';
import { useRouter } from 'next/router';
import styles from './signup.module.css';

export default function SignUp() {
  const [accountError, setAccountError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPassworError, setConfirmPassworError] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  const formList = [
    {
      formProps: {
        name: 'account',
        label: 'Account',
        autoComplete: 'family-name',
        id: 'account',
        placeholder: 'Enter your account',
        error: accountError,
        helperText: accountError ? 'At least eight characters, at least one letter and one number' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[0]);
        },
      },
      syncError: false,
      setError: setAccountError,

      validate: (value: string) => {
        const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{7,}$/;
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
        helperText: emailError ? 'Enter the correct email' : '',

        onChange: (e: any) => {
          changeValidate(e.target.value, formList[1]);
        },
      },
      syncError: false,
      setError: setEmailError,

      validate: (value: string) => {
        const reg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
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
        helperText: passwordError
          ? 'Must contain an uppercase, a lowercase letter, a number, a special character, and be 8 to 16 digits long'
          : '',
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
        const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@&%#_])[a-zA-Z0-9~!@&%#_]{8,16}$/;
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
        placeholder: 'Repeat your password',
        error: confirmPassworError,
        helperText: confirmPassworError ? 'Please enter the same password' : '',

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
        const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@&%#_])[a-zA-Z0-9~!@&%#_]{8,16}$/;
        return value === password && reg.test(value);
      },
    },
  ];

  const theme = createTheme({
    palette: {
      secondary: {
        contrastText: '#fff',
        main: '#239b56',
      },
    },
  });

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

    const accountElement = event.currentTarget.elements.account;
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
      await signUp({
        name: accountElement.value,
        password: passwordElement.value,
        email: emailElement.value,
      }).then((res) => {
        if (res) {
          router.push('/signin');
        } else {
          setAccountError(true);
          setEmailError(true);
          setPasswordError(true);
          setConfirmPassworError(true);
        }
      });
    }
  };

  return (
    <Grid container className={styles.containe}>
      <Grid item xs={6}>
        <Rotation />
      </Grid>
      <Grid item xs={6}>
        <ThemeProvider theme={theme}>
          <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
              sx={{
                mt: '5rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <picture>
                <img className={styles.logo} src="/images/login/logo.png" alt="" />
              </picture>
              <Typography component="h1" variant="h5">
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
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: '1.5rem' }}>
                <Grid container spacing={3}>
                  {formList.map((item) => (
                    <Grid item key={item.formProps.name} xs={12}>
                      <TextField required fullWidth color="success" {...item.formProps} />
                    </Grid>
                  ))}
                </Grid>
                <Button type="submit" fullWidth variant="contained" sx={{ mt: '2rem', mb: '2rem' }} color="secondary">
                  Sign Up
                </Button>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontSize: 18,
                  }}
                >
                  <Grid>
                    <span>Already have an account? </span>
                    <Link href="/signin">Sign in</Link>
                  </Grid>
                </Box>
              </Box>
            </Box>
          </Container>
        </ThemeProvider>
      </Grid>
    </Grid>
  );
}
