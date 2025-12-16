const FormField = ({ label, children, error, required }) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-semibold text-foreground/80 mb-1.5">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default FormField;