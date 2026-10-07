import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

export const TrailerModal = ({ open, onClose, videoKey, title = 'Official Trailer' }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      aria-labelledby="trailer-dialog-title"
      PaperProps={{
        sx: {
          backgroundColor: '#0a0d14',
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.8)',
        },
      }}
    >
      <DialogTitle
        id="trailer-dialog-title"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2.5,
          py: 1.5,
          color: '#ffffff',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Typography variant="h6" component="span" fontWeight="600" noWrap>
          {title}
        </Typography>
        <IconButton
          aria-label="Close trailer dialog"
          onClick={onClose}
          size="small"
          sx={{
            color: 'rgba(255, 255, 255, 0.7)',
            '&:hover': { color: '#ffffff', backgroundColor: 'rgba(255, 255, 255, 0.1)' },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#000000' }}>
        {open && videoKey ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              pt: '56.25%', // 16:9 Aspect Ratio
              bgcolor: '#000000',
            }}
          >
            <Box
              component="iframe"
              src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 0,
              }}
            />
          </Box>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default TrailerModal;
