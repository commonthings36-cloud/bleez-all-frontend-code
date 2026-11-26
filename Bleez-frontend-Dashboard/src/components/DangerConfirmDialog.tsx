import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface DangerConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  expectedWord?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const DangerConfirmDialog: React.FC<DangerConfirmDialogProps> = ({
  open,
  title,
  message,
  expectedWord = 'DELETE',
  confirmText = 'Permanently Purge',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
}) => {
  const [typedWord, setTypedWord] = useState('');

  useEffect(() => {
    if (open) {
      setTypedWord('');
    }
  }, [open]);

  const isMatched = typedWord.trim() === expectedWord;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'error.main', fontWeight: 800 }}>
        <WarningAmberIcon color="error" />
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}>
          {message}
        </DialogContentText>
        <Alert severity="error" sx={{ mb: 2.5, fontWeight: 600 }}>
          This operation is irreversible and will permanently delete all records from the database.
        </Alert>
        <Box sx={{ mt: 1 }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
            To confirm, please type <strong style={{ color: '#ef4444' }}>{expectedWord}</strong> below:
          </Typography>
          <TextField
            autoFocus
            fullWidth
            size="small"
            value={typedWord}
            onChange={(e) => setTypedWord(e.target.value)}
            placeholder={`Type ${expectedWord}`}
            error={typedWord.length > 0 && !isMatched}
            helperText={typedWord.length > 0 && !isMatched ? `Input does not match "${expectedWord}"` : ''}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          {cancelText}
        </Button>
        <Button
          onClick={() => {
            if (isMatched) {
              onConfirm();
              onClose();
            }
          }}
          variant="contained"
          color="error"
          disabled={!isMatched}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
