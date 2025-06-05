import React from 'react';
import '../styles/Button.css'; // Import the CSS for styling

function Button({ text, onClick, type = 'button', className = '', disabled = false, 'data-testid': dataTestId }) {
  return (
    <button
      type={type}
      className={`custom-button ${className}`}
      onClick={onClick}
      disabled={disabled}
      data-testid={dataTestId}
    >
      {text}
    </button>
  );
}

export default Button;
