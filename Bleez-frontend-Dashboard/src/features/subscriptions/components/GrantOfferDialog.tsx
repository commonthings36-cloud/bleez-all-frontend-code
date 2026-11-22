import React, { useEffect, useMemo, useState } from 'react';
import {
  Avatar, Box, Button, Chip, CircularProgress, Dialog, IconButton, InputAdornment, Stack, Switch, TextField,
  Typography, keyframes,
} from '@mui/material';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import AllInclusiveIcon from '@mui/icons-material/AllInclusive';
import { useSnackbar } from 'notistack';
import { subscriptionService } from '../services/subscription.service';

export interface GrantOfferDialogProps {
  open: boolean;
  onClose: () => void;
  targetUser?: { id: string; name: string; email: string } | null;
  onSuccess?: () => void;
}

type OfferType = 'EXTRA_AI_GENERATIONS' | 'PLAN_UPGRADE' | 'RESET_USAGE';

const OFFERS: { value: OfferType; title: string; text: string; color: string; icon: React.ReactElement }[] = [
  { value: 'EXTRA_AI_GENERATIONS', title: 'Extra AI trips', text: 'Add bonus itinerary generations to the account', color: '#7C3AED', icon: <AutoAwesomeIcon /> },
  { value: 'PLAN_UPGRADE', title: 'Free plan upgrade', text: 'Give Explorer or Business access for a period', color: '#F59E0B', icon: <WorkspacePremiumIcon /> },
  { value: 'RESET_USAGE', title: 'Reset monthly usage', text: 'Set the used-trips counter back to 0', color: '#0EA5E9', icon: <RestartAltIcon /> },
];

const PLANS = [
  { code: 'EXPLORER', name: 'Explorer', price: '$2.99/mo', perks: '20 trips · PDF export', color: '#0EA5E9' },
  { code: 'BUSINESS', name: 'Business', price: '$39/mo', perks: 'Unlimited trips · Branding · Team', color: '#7C3AED' },
];

const DURATIONS = [
  { days: 7, label: '7 days', hint: 'Trial' },
  { days: 30, label: '30 days', hint: '1 month' },
  { days: 90, label: '90 days', hint: 'Quarter' },
  { days: 365, label: '1 year', hint: 'Annual' },
  { days: 0, label: 'Lifetime', hint: 'No expiry' },
];

const QUICK = [5, 10, 25, 50, 100];

const pop = keyframes`from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}`;
const initials = (s?: string) => (s || '?').split(/[\s@.]/).filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join('') || '?';
const isEmail = (v: string) => /^\S+@\S+\.\S+$/.test(v);

const SectionLabel: React.FC<{ n: number; children: React.ReactNode }> = ({ n, children }) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.25 }}>
    <Box sx={{ width: 22, height: 22, borderRadius: '7px', bgcolor: 'primary.main', color: '#fff', display: 'grid', placeItems: 'center', fontSize: '0.75rem', fontWeight: 800 }}>{n}</Box>
    <Typography sx={{ fontWeight: 800, fontSize: '0.92rem' }}>{children}</Typography>
  </Stack>
);

export const GrantOfferDialog: React.FC<GrantOfferDialogProps> = ({ open, onClose, targetUser, onSuccess }) => {
  const { enqueueSnackbar } = useSnackbar();

  const [offerType, setOfferType] = useState<OfferType>('EXTRA_AI_GENERATIONS');
  const [extra, setExtra] = useState(10);
  const [unlimited, setUnlimited] = useState(false);
  const [planCode, setPlanCode] = useState('BUSINESS');
  const [days, setDays] = useState(30);
  const [reason, setReason] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setEmail(targetUser?.email || '');
      setOfferType('EXTRA_AI_GENERATIONS');
      setExtra(10);
      setUnlimited(false);
      setDays(30);
      setReason('');
    }
  }, [open, targetUser]);

  const recipientEmail = targetUser?.email || email.trim();
  const recipientName = targetUser?.name || (recipientEmail ? recipientEmail.split('@')[0] : '');
  const canSubmit = !submitting && (Boolean(targetUser?.id) || isEmail(recipientEmail)) && (offerType !== 'EXTRA_AI_GENERATIONS' || unlimited || extra > 0);

  const accent = OFFERS.find((o) => o.value === offerType)!.color;
  const plan = PLANS.find((p) => p.code === planCode)!;

  /** One-line plain-English summary of exactly what will happen. */
  const summary = useMemo(() => {
    if (offerType === 'EXTRA_AI_GENERATIONS') return unlimited ? 'Unlimited AI trip generations' : `+${extra} extra AI trip generations`;
    if (offerType === 'PLAN_UPGRADE') return `${plan.name} plan · ${days === 0 ? 'lifetime' : `${days} days`}`;
    return 'Monthly usage counter reset to 0';
  }, [offerType, unlimited, extra, plan, days]);

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await subscriptionService.grantOffer({
        userId: targetUser?.id,
        userEmail: recipientEmail,
        offerType,
        extraGenerations: unlimited ? 999999 : extra,
        isUnlimited: unlimited,
        planCode,
        durationDays: days > 0 ? days : undefined,
        reason: reason.trim() || undefined,
      });
      enqueueSnackbar(res?.message || 'Offer granted successfully!', { variant: 'success' });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || err?.message || 'Failed to grant offer', { variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '94vh' } }}>
      {/* Header */}
      <Box sx={{ position: 'relative', flexShrink: 0, px: 3, py: 2.5, color: '#fff', background: `linear-gradient(120deg, #4C1D95 0%, #7C3AED 60%, ${accent} 140%)`, transition: 'background .4s' }}>
        <Box sx={{ position: 'absolute', right: -30, top: -50, width: 180, height: 180, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.1)' }} />
        <Box sx={{ position: 'absolute', right: 90, bottom: -70, width: 130, height: 130, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.08)' }} />
        <IconButton onClick={onClose} disabled={submitting} size="small" sx={{ position: 'absolute', top: 12, right: 12, color: '#fff' }} aria-label="close"><CloseIcon /></IconButton>
        <Stack direction="row" spacing={1.75} alignItems="center" sx={{ position: 'relative' }}>
          <Box sx={{ width: 48, height: 48, borderRadius: '14px', bgcolor: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center' }}><CardGiftcardIcon /></Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', lineHeight: 1.3 }}>Grant offer & perks</Typography>
            <Typography sx={{ opacity: 0.9, fontSize: '0.85rem' }}>Give a user bonus itinerary credits, a free upgrade or a fresh quota</Typography>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 280px' }, gridTemplateRows: { md: 'minmax(0, 1fr)' }, flex: 1, minHeight: 0, overflowY: { xs: 'auto', md: 'hidden' } }}>
        {/* Form */}
        <Box sx={{ p: 3, overflowY: 'auto' }}>
          <Stack spacing={3}>
            <Box>
              <SectionLabel n={1}>Who gets it?</SectionLabel>
              {targetUser ? (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
                  <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>{initials(targetUser.name || targetUser.email)}</Avatar>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography noWrap sx={{ fontWeight: 800, lineHeight: 1.3 }}>{targetUser.name || 'User'}</Typography>
                    <Typography noWrap variant="body2" color="text.secondary">{targetUser.email}</Typography>
                  </Box>
                </Stack>
              ) : (
                <TextField
                  fullWidth size="small" placeholder="user@bleez.ai" value={email} onChange={(e) => setEmail(e.target.value)}
                  error={Boolean(email) && !isEmail(email.trim())}
                  helperText={email && !isEmail(email.trim()) ? 'Enter a valid email' : 'Registered email of the user'}
                  InputProps={{ startAdornment: <InputAdornment position="start"><AlternateEmailIcon fontSize="small" /></InputAdornment> }}
                />
              )}
            </Box>

            <Box>
              <SectionLabel n={2}>What are you giving?</SectionLabel>
              <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', sm: 'repeat(3,1fr)' } }}>
                {OFFERS.map((o) => {
                  const on = offerType === o.value;
                  return (
                    <Box
                      key={o.value} role="button" tabIndex={0} onClick={() => setOfferType(o.value)}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setOfferType(o.value)}
                      sx={{
                        position: 'relative', p: 1.75, minHeight: 128, borderRadius: '14px', cursor: 'pointer', border: '2px solid',
                        borderColor: on ? o.color : 'divider', bgcolor: on ? `${o.color}12` : 'transparent', transition: 'all .2s',
                        '&:hover': { borderColor: o.color, transform: 'translateY(-2px)' },
                      }}
                    >
                      {on && <CheckCircleIcon sx={{ position: 'absolute', top: 8, right: 8, fontSize: 20, color: o.color }} />}
                      <Box sx={{ width: 38, height: 38, borderRadius: '11px', display: 'grid', placeItems: 'center', bgcolor: `${o.color}1f`, color: o.color, mb: 1 }}>{o.icon}</Box>
                      <Typography sx={{ fontWeight: 800, fontSize: '0.9rem', lineHeight: 1.3 }}>{o.title}</Typography>
                      <Typography color="text.secondary" sx={{ fontSize: '0.76rem', lineHeight: 1.4, mt: 0.25 }}>{o.text}</Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box key={offerType} sx={{ animation: `${pop} .3s ease` }}>
              <SectionLabel n={3}>Details</SectionLabel>

              {offerType === 'EXTRA_AI_GENERATIONS' && (
                <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.75 }}>
                    {QUICK.map((n) => {
                      const on = !unlimited && extra === n;
                      return <Chip key={n} label={`+${n} trips`} onClick={() => { setUnlimited(false); setExtra(n); }} sx={{ fontWeight: 700, height: 32, borderRadius: '9px', bgcolor: on ? accent : 'transparent', color: on ? '#fff' : 'text.primary', border: '1px solid', borderColor: on ? accent : 'divider', '&:hover': { bgcolor: on ? accent : `${accent}14` } }} />;
                    })}
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                    <TextField
                      label="Custom amount" type="number" size="small" disabled={unlimited} value={extra}
                      onChange={(e) => setExtra(Math.max(1, parseInt(e.target.value) || 1))} sx={{ width: 170 }}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AllInclusiveIcon fontSize="small" sx={{ color: unlimited ? accent : 'text.secondary' }} />
                      <Typography sx={{ fontWeight: 700, fontSize: '0.88rem' }}>Unlimited</Typography>
                      <Switch checked={unlimited} onChange={(e) => setUnlimited(e.target.checked)} />
                    </Stack>
                  </Stack>
                </Box>
              )}

              {offerType === 'PLAN_UPGRADE' && (
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'grid', gap: 1.25, gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)' } }}>
                    {PLANS.map((p) => {
                      const on = planCode === p.code;
                      return (
                        <Box key={p.code} role="button" tabIndex={0} onClick={() => setPlanCode(p.code)} sx={{ p: 1.75, minHeight: 84, borderRadius: '14px', cursor: 'pointer', border: '2px solid', borderColor: on ? p.color : 'divider', bgcolor: on ? `${p.color}12` : 'transparent', transition: 'all .2s', '&:hover': { borderColor: p.color } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontWeight: 800 }}>{p.name}</Typography>
                            <Chip size="small" label={p.price} sx={{ height: 22, borderRadius: '6px', fontWeight: 700, bgcolor: `${p.color}1f`, color: p.color }} />
                          </Stack>
                          <Typography color="text.secondary" sx={{ fontSize: '0.78rem', mt: 0.5 }}>{p.perks}</Typography>
                        </Box>
                      );
                    })}
                  </Box>
                  <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', mb: 1 }}>For how long?</Typography>
                    <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(5, 1fr)' }}>
                      {DURATIONS.map((d) => {
                        const on = days === d.days;
                        return (
                          <Box key={d.days} role="button" tabIndex={0} onClick={() => setDays(d.days)} sx={{ py: 1, px: 0.5, textAlign: 'center', borderRadius: '10px', cursor: 'pointer', border: '1px solid', borderColor: on ? accent : 'divider', bgcolor: on ? accent : 'transparent', color: on ? '#fff' : 'text.primary', transition: 'all .2s', '&:hover': { borderColor: accent } }}>
                            <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', lineHeight: 1.3 }}>{d.label}</Typography>
                            <Typography sx={{ fontSize: '0.66rem', opacity: 0.8 }}>{d.hint}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                  </Box>
                </Stack>
              )}

              {offerType === 'RESET_USAGE' && (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 2, borderRadius: '14px', bgcolor: `${accent}12`, border: '1px solid', borderColor: `${accent}55` }}>
                  <RestartAltIcon sx={{ color: accent }} />
                  <Typography variant="body2">The user’s used-trips counter for this month goes back to 0, so they immediately get their full plan allowance again.</Typography>
                </Stack>
              )}
            </Box>

            <TextField
              label="Note / reason (optional)" placeholder="e.g. VIP loyalty reward, support gesture, early-adopter perk"
              multiline rows={2} size="small" fullWidth value={reason} onChange={(e) => setReason(e.target.value)}
            />
          </Stack>
        </Box>

        {/* Live summary */}
        <Box sx={{ p: 3, borderLeft: { md: '1px solid' }, borderTop: { xs: '1px solid', md: 'none' }, borderColor: 'divider', bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255,255,255,.03)' : 'rgba(124,58,237,.04)'), display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <Typography color="text.secondary" sx={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: 0.6, textTransform: 'uppercase', mb: 1.5 }}>Summary</Typography>
          <Box sx={{ p: 2, borderRadius: '16px', color: '#fff', background: `linear-gradient(135deg, #4C1D95, ${accent})`, position: 'relative', overflow: 'hidden' }}>
            <Box sx={{ position: 'absolute', right: -24, top: -24, width: 90, height: 90, borderRadius: '50%', bgcolor: 'rgba(255,255,255,.12)' }} />
            <Box sx={{ position: 'relative' }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: 'rgba(255,255,255,.2)', display: 'grid', placeItems: 'center', mb: 1.25 }}>
                {React.cloneElement(OFFERS.find((o) => o.value === offerType)!.icon as React.ReactElement<{ fontSize?: 'small' }>, { fontSize: 'small' })}
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.02rem', lineHeight: 1.35 }}>{summary}</Typography>
              <Typography sx={{ opacity: 0.85, fontSize: '0.78rem', mt: 0.5 }}>{OFFERS.find((o) => o.value === offerType)!.title}</Typography>
            </Box>
          </Box>

          <Stack spacing={1.25} sx={{ mt: 2.25 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', fontWeight: 800, bgcolor: recipientEmail ? 'primary.main' : 'action.disabledBackground' }}>{recipientEmail ? initials(recipientName) : '?'}</Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.85rem', lineHeight: 1.3 }}>{recipientEmail ? recipientName : 'No recipient yet'}</Typography>
                <Typography noWrap color="text.secondary" sx={{ fontSize: '0.74rem' }}>{recipientEmail || 'Add an email'}</Typography>
              </Box>
            </Stack>
            {reason.trim() && <Typography color="text.secondary" sx={{ fontSize: '0.78rem', fontStyle: 'italic' }}>“{reason.trim()}”</Typography>}
          </Stack>

          <Box sx={{ flexGrow: 1 }} />
          <Stack spacing={1} sx={{ mt: 3 }}>
            <Button variant="contained" size="large" onClick={submit} disabled={!canSubmit} startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <CardGiftcardIcon />} sx={{ fontWeight: 800 }}>
              {submitting ? 'Applying…' : 'Apply offer'}
            </Button>
            <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          </Stack>
        </Box>
      </Box>
    </Dialog>
  );
};
