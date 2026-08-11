import Swal from 'sweetalert2';

// Create a custom styled SweetAlert instance configured for Pastel UI theme
export const showPastelAlert = ({
  title,
  text,
  html,
  icon = 'info', // 'success' | 'error' | 'warning' | 'info' | 'question'
  confirmButtonText = 'ตกลง',
  cancelButtonText = 'ยกเลิก',
  showCancelButton = false,
  timer,
  timerProgressBar = false,
  customClass = {}
}) => {
  return Swal.fire({
    title,
    text,
    html,
    icon,
    confirmButtonText,
    cancelButtonText,
    showCancelButton,
    timer,
    timerProgressBar,
    buttonsStyling: false,
    customClass: {
      popup: 'pastel-swal-popup',
      title: 'pastel-swal-title',
      htmlContainer: 'pastel-swal-html',
      confirmButton: 'btn-pastel btn-pastel-primary pastel-swal-btn',
      cancelButton: 'btn-pastel btn-pastel-secondary pastel-swal-btn',
      ...customClass
    }
  });
};

export const showSuccessAlert = (title, text) => {
  return showPastelAlert({
    title,
    text,
    icon: 'success',
    confirmButtonText: 'ตกลง'
  });
};

export const showErrorAlert = (title, text) => {
  return showPastelAlert({
    title,
    text,
    icon: 'error',
    confirmButtonText: 'รับทราบ'
  });
};

export const showConfirmAlert = (title, text, confirmText = 'ยืนยัน', cancelText = 'ยกเลิก') => {
  return showPastelAlert({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText
  });
};

export const showPromptAlert = async (title, text, inputPlaceholder = '', defaultValue = '') => {
  const result = await Swal.fire({
    title,
    text,
    input: 'text',
    inputValue: defaultValue,
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: 'ตกลง',
    cancelButtonText: 'ยกเลิก',
    buttonsStyling: false,
    customClass: {
      popup: 'pastel-swal-popup',
      title: 'pastel-swal-title',
      htmlContainer: 'pastel-swal-html',
      input: 'input-pastel pastel-swal-input',
      confirmButton: 'btn-pastel btn-pastel-primary pastel-swal-btn',
      cancelButton: 'btn-pastel btn-pastel-secondary pastel-swal-btn'
    }
  });

  return result.isConfirmed ? result.value : null;
};

export default Swal;
