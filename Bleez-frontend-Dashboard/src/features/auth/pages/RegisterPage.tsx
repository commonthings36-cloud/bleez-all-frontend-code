import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Stack,
  Link,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { GlassCard } from '@/components/GlassCard';
import { apiClient } from '@/services/apiClient';
import { enqueueSnackbar } from 'notistack';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Full Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'ADMIN',
        roles: ['ADMIN'],
      });

      enqueueSnackbar('Admin account created successfully! Please sign in with your credentials.', { variant: 'success' });
      navigate('/auth/login');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
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
      <GlassCard sx={{ width: '100%', maxWidth: 460, p: { xs: 3, sm: 4 } }}>
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
              Create Admin Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your corporate details to register your account
            </Typography>
          </Box>

          {errorMsg && <Alert severity="error">{errorMsg}</Alert>}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Corporate Email Address"
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

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    fullWidth
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                  />
                )}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{ py: 1.5, mt: 1, fontSize: '1rem' }}
              >
                {loading ? 'Creating Account...' : 'Register Account'}
              </Button>
            </Stack>
          </Box>

          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link
                component={RouterLink}
                to="/auth/login"
                underline="hover"
                sx={{ fontWeight: 700, color: 'primary.main' }}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Stack>
      </GlassCard>
    </Box>
  );
};
