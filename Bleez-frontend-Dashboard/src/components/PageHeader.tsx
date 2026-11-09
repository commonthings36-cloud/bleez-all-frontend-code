import React from 'react';
import { Box, Typography, Breadcrumbs, Link, Stack } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Link as RouterLink } from 'react-router-dom';
import { HeaderDoodle } from './Illustrations';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  action,
}) => {
  return (
    <Box sx={{ mb: 3, position: 'relative' }}>
      <HeaderDoodle sx={{ position: 'absolute', top: -14, right: { md: 220, lg: 300 }, width: 300, height: 110, display: { xs: 'none', md: 'block' }, opacity: 0.55, zIndex: 0 }} />
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.secondary' }} />}
          aria-label="breadcrumb"
          sx={{ mb: 1 }}
        >
          <Link component={RouterLink} to="/" color="inherit" underline="hover" sx={{ fontSize: '0.8125rem' }}>
            Dashboard
          </Link>
          {breadcrumbs.map((item, index) =>
            item.path ? (
              <Link
                key={index}
                component={RouterLink}
                to={item.path}
                color="inherit"
                underline="hover"
                sx={{ fontSize: '0.8125rem' }}
              >
                {item.label}
              </Link>
            ) : (
              <Typography key={index} color="text.primary" sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {item.label}
              </Typography>
            )
          )}
        </Breadcrumbs>
      )}

      <Stack sx={{ position: 'relative', zIndex: 1 }} direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800, tracking: '-0.02em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {action && <Box>{action}</Box>}
      </Stack>
    </Box>
  );
};
