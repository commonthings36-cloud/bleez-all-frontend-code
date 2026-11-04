import React from 'react';
import { Card, CardProps, styled } from '@mui/material';

const StyledGlassCard = styled(Card)(({ theme }) => ({
  background: theme.palette.background.paper,
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderRadius: '16px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow:
    theme.palette.mode === 'dark'
      ? '0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 15px rgba(124, 58, 237, 0.05)'
      : '0 10px 30px -10px rgba(0, 0, 0, 0.05), 0 0 15px rgba(124, 58, 237, 0.03)',
  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    boxShadow:
      theme.palette.mode === 'dark'
        ? '0 15px 35px -10px rgba(0, 0, 0, 0.6), 0 0 20px rgba(124, 58, 237, 0.15)'
        : '0 15px 35px -10px rgba(0, 0, 0, 0.08), 0 0 20px rgba(124, 58, 237, 0.08)',
  },
}));

export const GlassCard: React.FC<CardProps> = ({ children, ...props }) => {
  return <StyledGlassCard {...props}>{children}</StyledGlassCard>;
};
