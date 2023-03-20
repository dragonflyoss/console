import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import styles from './logoup.module.css';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { InputAdornment } from '@mui/material';
import { http } from 'lib/api';

const theme = createTheme();

export default function SignUp(props: any) {
  const [accountError, setAccountError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPassworError, setconfirmPassworError] = useState(false);
  const [passwordvalue, setPasswordvalue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleClickShowPassword = (type: 'password' | 'confirmPassword') => {
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
  const formList = [
    {
      formProps: {
        name: 'account',
        label: 'Account',
        autoComplete: 'family-name',
        id: 'Account',
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
                handleClickShowPassword('password');
              }}
              edge="end"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        },
        onChange: (e: any) => {
          changeValidate(e.target.value, formList[2], () => {
            setPasswordvalue(e.target.value);
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
                  handleClickShowPassword('confirmPassword');
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
      setError: setconfirmPassworError,
      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[~!@&%#_])[a-zA-Z0-9~!@&%#_]{8,16}$/;
        return value === passwordvalue && reg.test(value);
      },
    },
  ];
  const allData: any = {};
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      allData[item.formProps.name] = value;
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });
    const canSubmit = Boolean(!formList.filter((item) => item.syncError).length);
    if (canSubmit) {
      http
        .post('/user/signup', {
          name: allData.account,
          password: allData.password,
          email: allData.email,
        })
        .then((res) => {
          localStorage.setItem('Token', res.token);
        });
    }
  };
  const gotoSignin = () => {
    props.onSetgnup();
  };
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 10,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <img className={styles.boximag} src={'/images/logo.png'} alt="" />
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
        </Box>
        <Box
          sx={{
            marginTop: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              {formList.map((item) => (
                <Grid item key={item.formProps.name} xs={12}>
                  <TextField required fullWidth color="success" {...item.formProps} />
                </Grid>
              ))}
            </Grid>
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} style={{ background: '#239B56' }}>
              Sign Up
            </Button>
            <Box
              sx={{
                marginTop: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontSize: 18,
              }}
            >
              <Grid>
                <span>Already have an account? </span>
                <Link onClick={gotoSignin}>Sign in</Link>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
