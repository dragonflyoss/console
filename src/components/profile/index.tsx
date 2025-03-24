import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  styled,
  Tab,
  TabProps,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { useState, useEffect, useContext } from 'react';
import { updateUser, getUser, updatePassword, signOut, getUserResponse } from '../../lib/api';
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
import { ReactComponent as Phone } from '../../assets/images/profile/phone.svg';
import { ReactComponent as CreatedAt } from '../../assets/images/profile/created-at.svg';
import { ReactComponent as Edit } from '../../assets/images/user/edit.svg';
import { ReactComponent as UserID } from '../../assets/images/user/id.svg';
import { ReactComponent as DetailRole } from '../../assets/images/user/detail-role.svg';
import TabPanel from '@mui/lab/TabPanel';
import { TabContext } from '@mui/lab';
import _ from 'lodash';
import { matchIsValidTel, MuiTelInput } from 'mui-tel-input';

type StyledTabProps = Omit<TabProps, 'component'> & {};

const AntTab = styled((props: StyledTabProps) => <Tab disableRipple {...props} />)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
  minHeight: '3rem',
  fontWeight: theme.typography.fontWeightRegular,
  color: 'var(--palette-grey-tab)',
  padding: '0',
  marginRight: '2rem',
  fontSize: '0.9rem',
  fontFamily: 'mabry-bold',
  '&:hover': {
    color: 'primary',
    opacity: 1,
  },
  '&.Mui-selected': {
    color: 'var(--palette-description-color)',
    fontFamily: 'mabry-bold',
  },
}));

const AntTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    backgroundColor: 'var(--palette-description-color)',
    borderRadius: '1rem',
  },
});

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
  const [showPersonalInformation, setShowPersonalInformation] = useState(true);
  const [phone, setPhone] = useState('');
  const [value, setValue] = useState('1');

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

  const { user, handleUserUpdate, role } = useContext(MyContext);

  const navigate = useNavigate();

  useEffect(() => {
    setUsers(user);
    setPhone(user.phone);
  }, [user]);

  const { old_password, new_password } = password;

  const handleChangePhone = (newValue: string, data: any, cb?: () => void) => {
    setPhone(newValue);
    const { setError } = data;
    setError(
      !matchIsValidTel(newValue, {
        onlyCountries: ['FR', 'BE', 'CN', 'US', 'CA', 'JP', 'KR', 'TW', 'HK', 'MO', 'SG', 'MY', 'TH', 'VN'],
      }),
    );

    cb && cb();
  };

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
        value: phone,
        placeholder: 'Enter your Phone',
        helperText: phoneError ? 'Invalid phone number.' : '',
        error: phoneError,

        onChange: (e: any) => {
          handleChangePhone(e, profileForm[1]);
        },
      },
      syncError: false,
      setError: setPhoneError,
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

    const canSubmit = Boolean(!profileForm.filter((item) => item.syncError).length);

    const formData = {
      bio: users.bio,
      email: users.email,
      location: users.location,
      phone: phone,
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
    setPassword({ ...password, old_password: '', new_password: '' });
  };

  const handleClose = (_event: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setSuccessMessage(false);
    setErrorMessage(false);
  };

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
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
      <Typography variant="h5" mb="2rem">
        My Profile
      </Typography>
      <TabContext value={value}>
        <Card className={styles.profileContainer}>
          <Box className={styles.profileImage}>
            <Box className={styles.profileContent}>
              <Box className={styles.avatarContainer}>
                <Box className={styles.avatarWrapper} />
                <Avatar alt="Remy Sharp" src={user?.avatar} className={styles.avatarContent} />
              </Box>
              <Box sx={{ pl: '1rem', pt: '1.4rem' }}>
                <Typography id="name-title" variant="h5" color="#FFFFFF">
                  {users?.name || '-'}
                </Typography>
                <Paper
                  // elevation={0}
                  id="state"
                  sx={{
                    borderRadius: '0.2rem',
                    // color: '#FFFFFF',
                    // display: 'inline-flex',
                    // alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.1rem 0.4rem',
                    mt: '0.4rem',
                    // boxShadow: 'var(--palette-card-box-shadow)',
                    background: '#18230f',
                    color: '#FFF',
                  }}
                >
                  <Typography variant="body2">{_.upperFirst(user?.state) || ''}</Typography>
                </Paper>
                {/* <Typography id="name-title" variant="body2" color="#FFFFFF">
                  {_.upperFirst(user?.state) || ''}
                </Typography> */}
              </Box>
            </Box>
          </Box>
          <Box className={styles.tabs}>
            <AntTabs value={value} onChange={handleChange} aria-label="nav tabs example" scrollButtons="auto">
              <AntTab
                icon={<UserID className={styles.tabIcon} />}
                key="1"
                iconPosition="start"
                label="Profile"
                sx={{ textTransform: 'none' }}
                id="tab-profile"
                value="1"
                onClick={cancelChangePassword}
              />
              <AntTab
                icon={<VpnKeyIcon className={styles.tabIcon} />}
                key="2"
                iconPosition="start"
                label="Security"
                id="tab-password"
                value="2"
              />
            </AntTabs>
          </Box>
        </Card>
        <TabPanel value="1" key="1" sx={{ p: 0 }}>
          <Card>
            {showPersonalInformation ? (
              <Box>
                <Grid className={styles.informationHeader}>
                  <Typography variant="h6" fontFamily="mabry-bold">
                    About me
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    sx={{
                      background: 'var(--palette-button-color)',
                      color: 'var(--palette-button-text-color)',
                      ':hover': { backgroundColor: 'var(--palette-hover-button-text-color)' },
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
                    borderColor: 'var(--palette-palette-divider)',
                    borderWidth: '0px 0px thin',
                  }}
                />
                <Box sx={{ p: '1.5rem 2rem 0 2rem' }}>
                  <Typography id="description" variant="subtitle1" component="div">
                    {user?.bio || '-'}
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
                            ) : item.label === 'Name' || item?.label === 'ID' ? (
                              <Typography id={item.name} component="div" fontFamily="mabry-bold" variant="body1">
                                {users?.[item?.name as keyof typeof users] || '-'}
                              </Typography>
                            ) : (
                              <Typography id={item.name} component="div" variant="body1">
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
                <Box component="form" onSubmit={handlePersonalInformation} noValidate className={styles.profileForm}>
                  {profileForm.map((item) =>
                    item.formProps.id === 'phone' ? (
                      <MuiTelInput
                        defaultCountry="CN"
                        color="success"
                        size="small"
                        key={item.formProps.name}
                        {...item.formProps}
                        className={styles.textField}
                      />
                    ) : (
                      <TextField
                        key={item.formProps.name}
                        size="small"
                        margin="dense"
                        color="success"
                        variant="outlined"
                        {...item.formProps}
                        className={styles.textField}
                      />
                    ),
                  )}
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
        </TabPanel>
        <TabPanel value="2" key="2" sx={{ p: 0 }}>
          <Card className={styles.passwordWrapper}>
            <Grid onSubmit={handleChangePassword} component="form" noValidate width="40rem">
              <Typography variant="subtitle1" id="change-password-title" fontFamily="mabry-bold" mb="1rem">
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
          </Card>
        </TabPanel>
      </TabContext>
    </Box>
  );
}
