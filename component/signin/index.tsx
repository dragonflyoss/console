import * as React from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useState } from 'react';
import styles from './logoin.module.css';
import IconButton from '@mui/material/IconButton';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Visibility from '@mui/icons-material/Visibility';
import { http } from 'utils/http';
import { useRouter } from 'next/router';


const theme = createTheme();

export default function signIn(props: any) {
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const router = useRouter()
  const gotoSignup=()=>{
    props.onGetcount()
  }
  const handleClickShowPassword = () => {
    setShowPassword((show) => !show);
  };
 
  const formList = [
    {
      formProps: {
        id: 'Account',
        label: 'Account',
        name: 'Account',
        autoComplete: 'Account',
        placeholder:"Enter your account",
        error:accountError
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
        placeholder:"Enter your password",
        error:passwordError,
        InputProps: {
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handleClickShowPassword();
              }}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        },
      },
      setError: setPasswordError,
    },
  ];
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const allData: any = {};
    const data = new FormData(event.currentTarget);
    formList.forEach((item) => {
      const value = data.get(item.formProps.name);
      allData[item.formProps.name] = value;
        
    });
    // console.log(allData);
    http.post('/api/v1/users/signin',{
      account:allData.Account
    }).then(res=>{
     if(res){
     console.log(res);
  // router.push('/security')
     }
      
    })
    
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
              <TextField margin="normal" color="success"  required fullWidth key={item.formProps.name} {...item.formProps} />
            ))}

            {/* <TextField margin="normal" required fullWidth color="success" />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              color="success"
              autoComplete="current-password"
            /> */}
            
            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} style={{ background: '#239B56' }}>
              Sign In
            </Button>
            <div className={styles.box}>
              <span className={styles.span1}></span>
              <span className={styles.span2}>or</span>
              <span className={styles.span3}></span>
            </div>
            <Box
              sx={{
                marginTop: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontSize: 18
              }}
              
            >
              <Grid >         
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

