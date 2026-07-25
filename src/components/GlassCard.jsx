export default function GlassCard({
  children,
  className = "",
  ...props
}) {
  return (
    <div
      className={`glass-card rounded-3xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
