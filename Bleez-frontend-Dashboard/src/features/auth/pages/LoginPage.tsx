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
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginStart, loginSuccess, loginFailure } from '@/store/slices/authSlice';
import { GlassCard } from '@/components/GlassCard';
import { apiClient } from '@/services/apiClient';
import { enqueueSnackbar } from 'notistack';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  rememberMe: z.boolean().default(true),
});

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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'radial-gradient(circle at 50% 10%, #1E1B4B 0%, #0F172A 70%)'
            : 'radial-gradient(circle at 50% 10%, #EEF2FF 0%, #F1F5F9 70%)',
      }}
    >
      <GlassCard sx={{ width: '100%', maxWidth: 450, p: { xs: 3, sm: 4 } }}>
        <Stack spacing={3}>
          {/* Brand Header */}
          <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFF',
                boxShadow: '0 8px 20px -4px rgba(124, 58, 237, 0.5)',
              }}
            >
              <FlightTakeoffIcon />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Bleez.AI
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                Enterprise SaaS Portal
              </Typography>
            </Box>
          </Stack>

          <Box textAlign="center">
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Sign in to Admin Panel
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your corporate credentials to access the console
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2.5}>
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email Address"
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email?.message}
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
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
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
                      label={<Typography variant="body2">Remember Me</Typography>}
                    />
                  )}
                />
                <Link
                  component={RouterLink}
                  to="/auth/forgot-password"
                  variant="body2"
                  underline="hover"
                  sx={{ fontWeight: 600, color: 'primary.main' }}
                >
                  Forgot Password?
                </Link>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={isLoading}
                sx={{ py: 1.5, fontSize: '1rem' }}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          {/* Registration Link */}
          <Box textAlign="center" sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an admin account?{' '}
              <Link
                component={RouterLink}
                to="/auth/register"
                underline="hover"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                Register Here
              </Link>
            </Typography>
          </Box>

        </Stack>
      </GlassCard>
    </Box>
  );
};
