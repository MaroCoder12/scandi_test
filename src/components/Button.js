import React from 'react';
import '../styles/Button.css'; // Import the CSS for styling

function Button({ text, onClick, type = 'button', className = '', disabled = false }) {
  return (
    <button
      type={type}
      className={`custom-button ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
}

export default Button;
