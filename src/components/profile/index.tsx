import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useState, useEffect, useContext } from 'react';
import { updateUser, getUser, updatePassword, signOut, getUserResponse } from '../../lib/api';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DescriptionIcon from '@mui/icons-material/Description';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import styles from './index.module.css';
import { getDatetime } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';
import { MyContext } from '../menu/index';
import { CancelLoadingButton, SavelLoadingButton } from '../loading-button';
import Card from '../card';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { ReactComponent as Name } from '../../assets/images/profile/name.svg';
import { ReactComponent as ID } from '../../assets/images/profile/id.svg';
import { ReactComponent as Email } from '../../assets/images/profile/email.svg';
import { ReactComponent as Location } from '../../assets/images/profile/location.svg';
import { ReactComponent as MyProfileLocation } from '../../assets/images/user/location.svg';
import { ReactComponent as Phone } from '../../assets/images/profile/phone.svg';
import { ReactComponent as CreatedAt } from '../../assets/images/profile/created-at.svg';
import { ReactComponent as ChangePassword } from '../../assets/images/user/change-password.svg';
import { ReactComponent as Edit } from '../../assets/images/user/edit.svg';

export default function Profile() {
  const [successMessage, setSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [errorMessageText, setErrorMessageText] = useState('');
  const [bioError, setBioError] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [locationError, setLocationError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmNewPasswordError, setConfirmNewPasswordErrorError] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordLoadingButton, setPasswordLoadingButton] = useState(false);
  const [personalLoadingButton, setPersonalLoadingButton] = useState(false);
  const [showMyProfile, setShowMyProfile] = useState(true);
  const [showPersonalInformation, setShowPersonalInformation] = useState(true);
  const [location, setLocation] = useState('');

  const [users, setUsers] = useState<getUserResponse>({
    id: 0,
    created_at: '',
    updated_at: '',
    is_del: 0,
    email: '',
    name: '',
    avatar: '',
    phone: '',
    state: '',
    location: '',
    bio: '',
  });
  const [password, setPassword] = useState({
    old_password: '',
    new_password: '',
  });

  const { user, handleUserUpdate } = useContext(MyContext);

  const navigate = useNavigate();

  useEffect(() => {
    setUsers(user);
    setLocation(user?.location);
  }, [user]);

  const { old_password, new_password } = password;

  const userLable = [
    {
      name: 'id',
      label: 'ID',
      icon: <ID className={styles.userIcon} />,
    },
    {
      name: 'name',
      label: 'Name',
      icon: <Name className={styles.userIcon} />,
    },
    {
      name: 'email',
      label: 'Email',
      icon: <Email className={styles.userIcon} />,
    },
    {
      name: 'location',
      label: 'Location',
      icon: <Location className={styles.userIcon} />,
    },
    {
      name: 'phone',
      label: 'Phone',
      icon: <Phone className={styles.userIcon} />,
    },
    {
      name: 'created_at',
      label: 'Created At',
      icon: <CreatedAt className={styles.userIcon} />,
    },
  ];

  const profileForm = [
    {
      formProps: {
        id: 'bio',
        label: 'Bio',
        name: 'bio',
        multiline: true,
        maxRows: 2,
        autoComplete: 'family-name',
        placeholder: 'Enter your description',
        helperText: bioError ? 'Fill in the characters, the length is 0-1000.' : '',
        error: bioError,
        value: users.bio,

        onChange: (e: any) => {
          setUsers({ ...users, bio: e.target.value });
          changeValidate(e.target.value, profileForm[0]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <DescriptionIcon className={styles.textFieldIcon} />:
            </InputAdornment>
          ),
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
        id: 'phone',
        label: 'Phone',
        name: 'phone',
        autoComplete: 'family-name',
        value: users.phone,
        placeholder: 'Enter your Phone',
        helperText: phoneError ? 'Invalid phone number.' : '',
        error: phoneError,

        onChange: (e: any) => {
          setUsers({ ...users, phone: e.target.value });
          changeValidate(e.target.value, profileForm[1]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LocalPhoneIcon className={styles.textFieldIcon} />:
            </InputAdornment>
          ),
        },
      },
      syncError: false,
      setError: setPhoneError,

      validate: (value: string) => {
        const reg = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$|^$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'location',
        label: 'Location',
        name: 'location',
        autoComplete: 'family-name',
        value: users.location,
        placeholder: 'Enter your location',
        helperText: locationError ? 'Fill in the characters, the length is 0-100.' : '',
        error: locationError,

        onChange: (e: any) => {
          setUsers({ ...users, location: e.target.value });
          changeValidate(e.target.value, profileForm[2]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LocationOnIcon className={styles.textFieldIcon} />:
            </InputAdornment>
          ),
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
        id: 'email',
        label: 'Email',
        name: 'email',
        required: true,
        autoComplete: 'family-name',
        value: users.email,
        placeholder: 'Enter your Email',
        helperText: emailError ? 'Email is invalid or already taken.' : '',
        error: emailError,

        onChange: (e: any) => {
          setUsers({ ...users, email: e.target.value });
          changeValidate(e.target.value, profileForm[3]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon className={styles.textFieldIcon} />:
            </InputAdornment>
          ),
        },
      },
      syncError: false,
      setError: setEmailError,

      validate: (value: string) => {
        const reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        return reg.test(value);
      },
    },
  ];

  const passwordForm = [
    {
      formProps: {
        id: 'oldPassword',
        label: 'Old password',
        name: 'oldPassword',
        autoComplete: 'family-name',
        type: showOldPassword ? 'text' : 'password',
        placeholder: 'Enter your old password',
        value: old_password,
        helperText: oldPasswordError ? 'Fill in the characters, the maximum length is 16.' : '',
        error: oldPasswordError,

        onChange: (e: any) => {
          changeValidate(e.target.value, passwordForm[0]);
          setPassword({ ...password, old_password: e.target.value });
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <VpnKeyIcon className={styles.textFieldIcon} />
            </InputAdornment>
          ),

          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('oldPassword');
              }}
              edge="end"
            >
              {showOldPassword ? (
                <Visibility className={styles.textFieldIcon} />
              ) : (
                <VisibilityOff className={styles.textFieldIcon} />
              )}
            </IconButton>
          ),
        },
      },
      syncError: false,
      setError: setOldPasswordError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])[^]{0,16}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'newPassword',
        label: 'New password',
        name: 'newPassword',
        type: showNewPassword ? 'text' : 'password',
        autoComplete: 'family-name',
        placeholder: 'Enter your new password',
        helperText: newPasswordError ? `At least 8-16 characters, with at least 1 lowercase letter and 1 number.` : '',
        error: newPasswordError,
        value: new_password,

        onChange: (e: any) => {
          changeValidate(e.target.value, passwordForm[1], () => {
            setNewPassword(e.target.value);
          });
          setPassword({ ...password, new_password: e.target.value });
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon className={styles.textFieldIcon} />
            </InputAdornment>
          ),
          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('newPassword');
              }}
              edge="end"
            >
              {showNewPassword ? (
                <Visibility className={styles.textFieldIcon} />
              ) : (
                <VisibilityOff className={styles.textFieldIcon} />
              )}
            </IconButton>
          ),
        },
      },
      syncError: false,
      setError: setNewPasswordError,
      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return reg.test(value);
      },
    },
    {
      formProps: {
        id: 'confirmNewPassword',
        label: 'Confirm new password',
        name: 'confirmNewPassword',
        type: showConfirmPassword ? 'text' : 'password',
        autoComplete: 'family-name',
        placeholder: 'Enter your payload',
        helperText: confirmNewPasswordError ? 'Please enter the same password.' : '',
        error: confirmNewPasswordError,

        onChange: (e: any) => {
          changeValidate(e.target.value, passwordForm[2]);
        },

        InputProps: {
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon className={styles.textFieldIcon} />
            </InputAdornment>
          ),

          endAdornment: (
            <IconButton
              aria-label="toggle password visibility"
              onClick={() => {
                handlePassword('confirmPassword');
              }}
              edge="end"
            >
              {showConfirmPassword ? (
                <Visibility className={styles.textFieldIcon} />
              ) : (
                <VisibilityOff className={styles.textFieldIcon} />
              )}
            </IconButton>
          ),
        },
      },
      syncError: false,
      setError: setConfirmNewPasswordErrorError,

      validate: (value: string) => {
        const reg = /^(?=.*[a-z])(?=.*\d)[^]{8,16}$/;
        return value === newPassword && reg.test(value);
      },
    },
  ];

  const handlePassword = (type: 'oldPassword' | 'newPassword' | 'confirmPassword') => {
    if (type === 'oldPassword') {
      setShowOldPassword((show) => !show);
    } else if (type === 'newPassword') {
      setShowNewPassword((show) => !show);
    } else {
      setShowConfirmPassword((show) => !show);
    }
  };

  const changeValidate = (value: string, data: any, cb?: () => void) => {
    const { setError, validate } = data;
    setError(!validate(value));
    cb && cb();
  };

  const handlePersonalInformation = async (event: any) => {
    event.preventDefault();
    setPersonalLoadingButton(true);

    const data = new FormData(event.currentTarget);

    profileForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!profileForm.filter((item) => item.syncError).length);

    const formData = {
      bio: users.bio,
      email: users.email,
      location: users.location,
      phone: users.phone,
    };

    if (canSubmit) {
      try {
        if (users.id) {
          await updateUser(String(users.id), { ...formData });

          const user = await getUser(String(users.id));

          handleUserUpdate(user);
          setPersonalLoadingButton(false);
          setShowPersonalInformation(true);
          setSuccessMessage(true);
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setPersonalLoadingButton(false);
        }
      }
    } else {
      setPersonalLoadingButton(false);
    }
  };

  const cancelHandlePersonalInformation = async () => {
    setUsers(user);
    setLocation(user?.location);
    setShowPersonalInformation(true);
  };

  const handleChangePassword = async (event: any) => {
    setPasswordLoadingButton(true);
    event.preventDefault();

    const data = new FormData(event.currentTarget);

    passwordForm.forEach((item) => {
      const value = data.get(item.formProps.name);
      item.setError(!item.validate(value as string));
      item.syncError = !item.validate(value as string);
    });

    const canSubmit = Boolean(!passwordForm.filter((item) => item.syncError).length);

    const formData = {
      old_password: password.old_password,
      new_password: password.new_password,
    };

    if (canSubmit) {
      try {
        if (user.id) {
          await updatePassword(String(user.id), { ...formData });

          setSuccessMessage(true);
          setPasswordLoadingButton(false);
          await signOut();
          navigate('/signin');
        }
      } catch (error) {
        if (error instanceof Error) {
          setErrorMessage(true);
          setErrorMessageText(error.message);
          setPasswordLoadingButton(false);
        }
      }
    } else {
      setPasswordLoadingButton(false);
    }
  };

  const cancelChangePassword = () => {
    setShowMyProfile(true);
    setPassword({ ...password, old_password: '', new_password: '' });
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
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
      <Typography id="my-profile" sx={{ mb: '2rem', fontFamily: 'mabry-bold' }} variant="h6">
        My Profile
      </Typography>
      <Card className={styles.profileContainer}>
        {showMyProfile ? (
          <Box className={styles.avatarContainer}>
            <Box display="flex" alignItems="center">
              <Stack direction="row" spacing={2}>
                <Avatar alt="Remy Sharp" src={users?.avatar} className={styles.avatarContent} />
              </Stack>
              <Box sx={{ pl: '1rem' }}>
                <Typography id="name-title" variant="h5">
                  {users?.name || '-'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', pt: '0.3rem' }}>
                  <MyProfileLocation className={styles.userIcon} />
                  <Typography variant="body2" component="div" ml="0.5rem" color="#919EAB" fontFamily="mabry-bold">
                    {location || '-'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ justifyContent: 'flex-end' }}>
              <Button
                size="small"
                sx={{
                  background: 'var(--palette--button-color)',
                  color: 'var(--palette--button-text-color)',
                  ':hover': { backgroundColor: 'var(--palette--hover-button-text-color)' },
                }}
                variant="contained"
                onClick={() => {
                  setShowMyProfile(false);
                }}
              >
                <ChangePassword className={styles.editIcon} />
                Change Password
              </Button>
            </Box>
          </Box>
        ) : (
          <Grid sx={{ width: '40rem' }} onSubmit={handleChangePassword} component="form" noValidate>
            <Typography variant="subtitle1" fontFamily="mabry-bold" mb="1rem">
              Change Password
            </Typography>
            {passwordForm.map((item) => (
              <Box key={item.formProps.name}>
                <TextField size="small" margin="normal" color="success" fullWidth required {...item.formProps} />
              </Box>
            ))}
            <Box mt="2rem">
              <CancelLoadingButton
                id="cancel-change-password"
                loading={passwordLoadingButton}
                onClick={cancelChangePassword}
              />
              <SavelLoadingButton
                loading={passwordLoadingButton}
                endIcon={<CheckCircleIcon />}
                id="change-password"
                text="Save"
              />
            </Box>
          </Grid>
        )}
      </Card>
      <Card>
        {showPersonalInformation ? (
          <Box>
            <Grid className={styles.informationHeader}>
              <Typography variant="subtitle1" fontFamily="mabry-bold">
                About me
              </Typography>
              <Button
                size="small"
                variant="contained"
                sx={{
                  background: 'var(--palette--button-color)',
                  color: 'var(--palette--button-text-color)',
                  ':hover': { backgroundColor: 'var(--palette--hover-button-text-color)' },
                }}
                onClick={() => {
                  setShowPersonalInformation(false);
                }}
              >
                <Edit className={styles.editIcon} />
                Edit
              </Button>
            </Grid>
            <Divider
              sx={{
                borderStyle: 'dashed',
                borderColor: 'var(--palette--palette-divider)',
                borderWidth: '0px 0px thin',
              }}
            />
            <Box sx={{ p: '1.5rem 2rem 0 2rem' }}>
              <Typography id="description" variant="subtitle1" component="div" pb="1.5rem">
                {user?.bio || '-'}
              </Typography>
              <Typography variant="subtitle1" fontFamily="mabry-bold">
                Personal Details
              </Typography>
            </Box>
            <Box className={styles.informationContainer}>
              {userLable.map((item) => {
                return (
                  <Box className={styles.informationContent} key={item.name}>
                    <Box display="flex" alignItems="center">
                      <Box className={styles.informationLable}>
                        {item.icon}
                        <Typography component="div" variant="body1" className={styles.informationLableText}>
                          {item.label}
                        </Typography>
                      </Box>
                      <Box ml="0.6rem">
                        {item.name === 'created_at' ? (
                          users?.[item.name] ? (
                            <Chip
                              id={item.name}
                              avatar={<MoreTimeIcon />}
                              label={getDatetime(users?.[item.name]) || '-'}
                              variant="outlined"
                              size="small"
                            />
                          ) : (
                            <Typography id={item.name} component="div" variant="body1" fontFamily="mabry-bold">
                              -
                            </Typography>
                          )
                        ) : (
                          <Typography id={item.name} component="div" variant="body1" fontFamily="mabry-bold">
                            {users?.[item?.name as keyof typeof users] || '-'}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box p="2rem">
            <Typography variant="subtitle1" fontFamily="mabry-bold" mb="1rem">
              Update Personal Information
            </Typography>
            <Box component="form" onSubmit={handlePersonalInformation} noValidate>
              {profileForm.map((item) => (
                <Box key={item.formProps.name}>
                  <TextField
                    size="small"
                    margin="dense"
                    color="success"
                    variant="outlined"
                    {...item.formProps}
                    className={styles.textField}
                  />
                </Box>
              ))}
              <Box mt="2rem">
                <CancelLoadingButton
                  id="cancel"
                  loading={personalLoadingButton}
                  onClick={cancelHandlePersonalInformation}
                />
                <SavelLoadingButton
                  loading={personalLoadingButton}
                  endIcon={<CheckCircleIcon />}
                  id="save"
                  text="Save"
                />
              </Box>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
}
