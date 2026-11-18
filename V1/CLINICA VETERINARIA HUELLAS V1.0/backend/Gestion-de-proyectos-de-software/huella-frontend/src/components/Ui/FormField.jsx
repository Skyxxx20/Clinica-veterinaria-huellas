export default function FormField({ id, label, error, children }) {
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}