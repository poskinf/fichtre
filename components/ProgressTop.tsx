/** Counter + progress bar: identical on the cards and on the sheets. */
export function ProgressTop({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="progress-top">
      <div className="counter-row">
        <p className="counter" aria-live="polite">
          {label}
        </p>
      </div>
      <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={max} aria-valuenow={value}>
        <span style={{ width: `${max ? (value / max) * 100 : 0}%` }} />
      </div>
    </div>
  );
}
