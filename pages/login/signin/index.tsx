import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styles from './logoin.module.css';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { http } from 'lib/api';
import { useRouter } from 'next/router';
import { useState } from 'react';
import Image from 'next/image';

export default function SignIn(props: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [accountHelptext, setAccountHelptext] = useState('');
  const [passwordHelptext, setPasswordHelptext] = useState('');
  const theme = createTheme();
  const router = useRouter();
  const gotoSignup = () => {
    props.onGetcount();
  };
  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };
  const formList = [
    {
      formProps: {
        id: 'Account',
        label: 'Account',
        name: 'account',
        autoComplete: 'Account',
        placeholder: 'Enter your account',
        helperText: accountError ? accountHelptext : '',
        error: accountError,
      },
      setError: setAccountError,
    },
    {
      formProps: {
        id: 'password',
        label: 'Password',
        name: 'password',
        type: showPassword ? 'text' : 'password',
        autoComplete: 'password',
        placeholder: 'Enter your password',
        helperText: passwordError ? passwordHelptext : '',
        error: passwordError,
        InputProps: {
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handleClickShowPassword();
              }}
              edge="end"
            >
              {showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
          ),
        },
      },
      setError: setPasswordError,
    },
  ];
  const handleSubmit = (event: any) => {
    event.preventDefault();
    const allData: any = {};
    const data = new FormData(event.currentTarget);
    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      allData[item.formProps.name] = value;
    });
    if (allData.account !== '' && allData.password !== '') {
      http
        .get(`/user/signin/:${allData.account}`, {
          password: allData.password,
        })
        .then((res) => {
          if (res.code === 200) {
            router.push('/security');
          } else {
            setAccountError(true);
            setPasswordError(true);
          }
        });
    } else {
      setAccountError(true);
      setPasswordError(true);
      setPasswordHelptext('Please enter the correct password');
      setAccountHelptext('Please enter the correct account number ');
    }
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
          <Image className={styles.dragonflylogoimage} src={'/images/logo.png'} alt="" />
          <Typography variant="h4" gutterBottom>
            Welcome back!
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            through which you can easily configure clusters and view cluster information.
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
          <Box component="form" onSubmit={handleSubmit} noValidate>
            {formList.map((item) => (
              <TextField
                margin="normal"
                color="success"
                required
                fullWidth
                key={item.formProps.name}
                {...item.formProps}
              />
            ))}
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} style={{ background: '#239B56' }}>
              Sign In
            </Button>
            <div className={styles.splitlinebox}>
              <span className={styles.leftsplitline}></span>
              <span className={styles.splitlinetext}>or</span>
              <span className={styles.rightsplitline}></span>
            </div>
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
                <span>New to Dragnfly? </span>
                <Link onClick={gotoSignup}>Create an account.</Link>
              </Grid>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
