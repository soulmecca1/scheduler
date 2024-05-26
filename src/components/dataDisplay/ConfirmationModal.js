import { Dialog, DialogActions, Button, DialogTitle } from "@mui/material";

const ConfirmationModal = ({
  isOpen,
  setIsOpen,
  onConfirm,
  title,
  confirmationText = "Confirm",
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogActions>
        <Button
          onClick={() => {
            setIsOpen(false);
          }}
        >
          Cancel
        </Button>
        <Button onClick={onConfirm} autoFocus>
          {confirmationText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmationModal;
