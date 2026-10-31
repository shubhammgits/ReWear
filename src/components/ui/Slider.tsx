"use client";

/** Styled native range input (keyboard + screen-reader friendly by default). */
export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  dark,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
  dark?: boolean;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className={dark ? "text-sm text-ivory/75" : "text-sm text-ink/70"}>
          {label}
        </label>
        <output htmlFor={id} className="font-display text-xl">
          {format ? format(value) : value}
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={format ? format(value) : String(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
    </div>
  );
}
