export default function GlassCard({ className = "", children }) {
  return (
    <div className={`glass-card rounded-3xl ${className}`}>
      {children}
    </div>
  );
}
