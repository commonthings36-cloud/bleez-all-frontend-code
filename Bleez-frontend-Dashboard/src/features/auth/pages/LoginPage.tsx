import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  keyframes,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { WorldTourPanel } from '../components/WorldTourPanel';
import { apiClient } from '@/services/apiClient';
import { enqueueSnackbar } from 'notistack';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean().default(true),
});

const rise = keyframes`from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}`;

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    dispatch(loginStart());
    try {
      const response = await apiClient.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      const { token, refreshToken, user } = response.data;
      const roles: string[] = Array.isArray(user?.roles) ? user.roles : [];

      if (!token || !user) {
        dispatch(loginFailure('The server returned an invalid login response.'));
        return;
      }
      // The admin APIs are restricted to ROLE_ADMIN, so other accounts cannot use this dashboard.
      if (!roles.includes('ADMIN')) {
        dispatch(loginFailure('This account does not have administrator access.'));
        return;
      }

      const [firstName, ...rest] = String(user.name || user.email).split(' ');
      dispatch(
        loginSuccess({
          user: {
            id: user.id,
            email: user.email,
            firstName,
            lastName: rest.join(' '),
            avatarUrl: user.picture || undefined,
            role: 'ADMIN',
            permissions: [],
            status: 'ACTIVE',
            createdAt: user.createdAt || '',
          },
          token,
          refreshToken: refreshToken || '',
          rememberMe: data.rememberMe,
        })
      );

      enqueueSnackbar('Signed in successfully!', { variant: 'success' });
      navigate('/dashboard');
    } catch (err: any) {
      const status = err.response?.status;
      const message =
        status === 401 || status === 403
          ? 'Incorrect email or password.'
          : err.code === 'ERR_NETWORK'
            ? 'Cannot reach the server. Please try again shortly.'
            : err.response?.data?.message || 'Login failed. Please try again.';
      dispatch(loginFailure(message));
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '1.1fr 1fr' },
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 80% 10%, #1E1B4B 0%, #0F172A 70%)'
            : 'radial-gradient(circle at 80% 10%, #EEF2FF 0%, #F8FAFC 70%)',
      }}
    >
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <WorldTourPanel />
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: { xs: 2, sm: 4 } }}>
        <Box sx={{ width: '100%', maxWidth: 420, animation: `${rise} .5s ease both` }}>
          <Stack spacing={3.5}>
            {/* Brand (shown on mobile where the photo panel is hidden) */}
            <Stack direction="row" alignItems="center" spacing={1.5} sx={{ display: { xs: 'flex', md: 'none' } }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.5)' }}>
                <FlightTakeoffIcon />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>Bleez.AI</Typography>
            </Stack>

            <Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.9rem', letterSpacing: '-0.02em', lineHeight: 1.2 }}>Welcome back 👋</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>
                Sign in with your administrator account to open the console.
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ borderRadius: '12px' }}>{error}</Alert>}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack spacing={2.5}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Email address"
                      autoComplete="username"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      InputProps={{ startAdornment: <InputAdornment position="start"><MailOutlineIcon fontSize="small" /></InputAdornment> }}
                    />
                  )}
                />

                <Controller
                  name="password"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Password"
                      autoComplete="current-password"
                      type={showPassword ? 'text' : 'password'}
                      fullWidth
                      error={!!errors.password}
                      helperText={errors.password?.message}
                      InputProps={{
                        startAdornment: <InputAdornment position="start"><LockOutlinedIcon fontSize="small" /></InputAdornment>,
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" aria-label="Toggle password visibility">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Controller
                    name="rememberMe"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        control={<Checkbox {...field} checked={field.value} />}
                        label={<Typography variant="body2">Keep me signed in</Typography>}
                      />
                    )}
                  />
                  <Link component={RouterLink} to="/auth/forgot-password" variant="body2" underline="hover" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    Forgot password?
                  </Link>
                </Stack>

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={isLoading}
                  endIcon={!isLoading && <ArrowForwardIcon />}
                  sx={{ py: 1.5, fontSize: '1rem', fontWeight: 800, borderRadius: '12px' }}
                >
                  {isLoading ? 'Signing in…' : 'Sign in'}
                </Button>
              </Stack>
            </Box>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Don't have an admin account?{' '}
              <Link component={RouterLink} to="/auth/register" underline="hover" sx={{ fontWeight: 700, color: 'primary.main' }}>
                Register here
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};
