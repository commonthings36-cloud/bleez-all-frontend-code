import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { EmptyArt } from './Illustrations';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
}) => {
  const buttonLabel = actionLabel || actionText;
  return (
    <Stack
      alignItems="center"
      justifyContent="center"
      spacing={2}
      sx={{ py: 5, px: 3, textAlign: 'center', width: '100%' }}
    >
      {icon ? <Box sx={{ p: 2, borderRadius: '50%', backgroundColor: 'action.hover' }}>{icon}</Box> : <EmptyArt />}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
          {description}
        </Typography>
      )}
      {buttonLabel && onAction && (
        <Button variant="contained" onClick={onAction} sx={{ mt: 1 }}>
          {buttonLabel}
        </Button>
      )}
    </Stack>
  );
};
