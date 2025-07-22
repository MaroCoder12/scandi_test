import '../styles/Button.css';

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
