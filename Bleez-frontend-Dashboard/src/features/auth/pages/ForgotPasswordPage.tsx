import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Alert, Stack, Link } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockResetIcon from '@mui/icons-material/LockReset';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink } from 'react-router-dom';
import { GlassCard } from '@/components/GlassCard';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (_data: ForgotFormData) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLoading(false);
    setSubmitted(true);
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
          <Box textAlign="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: '#fff',
                mx: 'auto',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockResetIcon fontSize="large" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              No worries, enter your corporate email below and we will send you a password reset link.
            </Typography>
          </Box>

          {submitted ? (
            <Alert severity="success">
              Password reset link sent! Check your inbox for instructions to reset your password.
            </Alert>
          ) : (
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <Stack spacing={2.5}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Corporate Email Address"
                      placeholder="admin@aitravelglobe.com"
                      fullWidth
                      error={!!errors.email}
                      helperText={errors.email?.message}
                    />
                  )}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5 }}
                >
                  {loading ? 'Sending Request...' : 'Send Reset Link'}
                </Button>
              </Stack>
            </Box>
          )}

          <Box textAlign="center">
            <Link
              component={RouterLink}
              to="/auth/login"
              variant="body2"
              sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, fontWeight: 600 }}
            >
              <ArrowBackIcon fontSize="small" /> Back to Sign In
            </Link>
          </Box>
        </Stack>
      </GlassCard>
    </Box>
  );
};
