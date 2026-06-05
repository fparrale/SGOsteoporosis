import React from 'react';
import { toaster, Message } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';

const responsivePlacement = (preferred) =>
  window.innerWidth < 640 ? 'topCenter' : preferred;

const show = (type, message, placement) => {
  toaster.push(
    <Message showIcon type={type} closable duration={4000}>
      {message}
    </Message>,
    { placement: responsivePlacement(placement) }
  );
};

const Alert = {
  success: (message) => show('success', message, 'topCenter'),
  error:   (message) => show('error',   message, 'topEnd'),
  warning: (message) => show('warning', message, 'topEnd'),
  info:    (message) => show('info',    message, 'topCenter'),
};

export default Alert;
