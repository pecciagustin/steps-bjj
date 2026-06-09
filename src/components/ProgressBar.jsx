export default function ProgressBar({ value }) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="h-1.5 w-full bg-elevated rounded-full overflow-hidden">
      <div
        className="h-full bg-jade rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
