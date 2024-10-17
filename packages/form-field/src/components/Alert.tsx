interface AlertProps {
  errors: string[];
}

function Alert({ errors }: AlertProps) {
  return (
    <div
      style={{
        color: '#f56c6c',
        border: '2px solid transparent',
        borderColor: '#f56c6c',
        backgroundColor: '#2b1d1d',
        borderRadius: 6,
        padding: 3,
        paddingBottom: 0,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {errors.map(error => (
        <div
          key={error}
          style={{
            paddingBottom: 3,
          }}
        >
          {error}
        </div>
      ))}
    </div>
  );
}

export default Alert;
