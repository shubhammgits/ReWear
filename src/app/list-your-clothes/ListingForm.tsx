"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Camera, Check, ChevronLeft, ChevronRight, ImagePlus, PartyPopper, Trash2, Wand2 } from "lucide-react";
import { OCCASIONS, SIZES, content } from "@/lib/api";
import { PLATFORM_CUT } from "@/lib/pricing";
import type { OccasionName, Size } from "@/lib/types";
import { cn, formatINR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const steps = ["Photos", "Details", "Pricing", "Availability"] as const;

interface Photo {
  id: string;
  url: string;
  name: string;
}

interface FormState {
  photos: Photo[];
  name: string;
  category: "Indian" | "Western" | "";
  occasions: OccasionName[];
  size: Size | "";
  city: string;
  description: string;
  per4h: number;
  perDay: number;
  per3Days: number;
  deposit: number;
  available: string[];
}

const initial: FormState = {
  photos: [],
  name: "",
  category: "",
  occasions: [],
  size: "",
  city: "",
  description: "",
  per4h: 399,
  perDay: 799,
  per3Days: 1899,
  deposit: 1500,
  available: [],
};

const field = "h-12 w-full rounded-2xl bg-ivory px-4 text-base ring-1 ring-ink/10 transition focus:outline-none focus:ring-2 focus:ring-plum";
const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function ListingForm() {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => setForm((f) => ({ ...f, [k]: v }));

  // Revoke preview URLs when the form unmounts
  const photosRef = useRef(form.photos);
  photosRef.current = form.photos;
  useEffect(() => () => photosRef.current.forEach((p) => URL.revokeObjectURL(p.url)), []);

  const validate = (s: number) => {
    const e: string[] = [];
    if (s === 0 && form.photos.length < 1) e.push("Add at least one photo. Natural light works wonders.");
    if (s === 1) {
      if (form.name.trim().length < 3) e.push("Give your outfit a name (at least 3 characters).");
      if (!form.category) e.push("Choose Indian or Western wear.");
      if (!form.occasions.length) e.push("Pick at least one occasion.");
      if (!form.size) e.push("Select a size.");
      if (!form.city) e.push("Select your city.");
    }
    if (s === 2) {
      if (form.per4h < 99) e.push("4-hour price should be at least ₹99.");
      if (form.perDay < form.per4h) e.push("Day price should be at least the 4-hour price.");
      if (form.per3Days < form.perDay) e.push("3-day price should be at least the day price.");
    }
    if (s === 3 && form.available.length < 1) e.push("Mark at least one day your outfit is free to rent.");
    setErrors(e);
    return e.length === 0;
  };

  const go = (to: number) => {
    if (to > step && !validate(step)) return;
    setErrors([]);
    setDir(to > step ? 1 : -1);
    setStep(to);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = () => {
    if (!validate(3)) return;
    setDone(true);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (done) {
    return (
      <div ref={top} className="mx-auto max-w-2xl px-6 pb-28">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] bg-ivory p-10 text-center shadow-lift ring-1 ring-ink/5">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 240, damping: 12 }} className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gold/20">
            <PartyPopper className="h-9 w-9 text-plum" aria-hidden />
          </motion.div>
          <h2 className="mt-6 text-4xl">&ldquo;{form.name}&rdquo; is live!</h2>
          <p className="mx-auto mt-3 max-w-md text-ink/70">
            Our team will review your photos within 2 hours. At {formatINR(form.perDay)}/day and 3 rentals a month, that&apos;s about{" "}
            <strong className="text-plum">{formatINR(form.perDay * 3 * (1 - PLATFORM_CUT))}</strong> in your pocket.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/dashboard">Go to my dashboard</Button>
            <Button
              variant="secondary"
              onClick={() => {
                setForm(initial);
                setStep(0);
                setDone(false);
              }}
            >
              List another piece
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div ref={top} className="mx-auto max-w-4xl scroll-mt-28 px-6 pb-28">
      {/* Progress */}
      {/* Sticks under the header on phones so progress stays visible on long steps */}
      <ol className="sticky top-20 z-20 -mx-6 mb-8 grid grid-cols-4 gap-2 bg-ivory/90 px-6 py-1 backdrop-blur-md sm:static sm:mx-0 sm:mb-10 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none" aria-label="Listing progress">
        {steps.map((s, i) => (
          <li key={s}>
            <button
              onClick={() => i < step && go(i)}
              disabled={i > step}
              aria-current={i === step ? "step" : undefined}
              className="group min-h-11 w-full py-2 text-left disabled:cursor-default"
            >
              <span className="block h-1.5 overflow-hidden rounded-full bg-sand">
                <motion.span className="block h-full bg-plum" initial={false} animate={{ width: i < step ? "100%" : i === step ? "50%" : "0%" }} transition={{ duration: 0.5 }} />
              </span>
              <span className={cn("mt-2 flex min-w-0 items-center gap-1.5 text-xs font-semibold sm:text-sm", i <= step ? "text-ink" : "text-muted")}>
                {i < step ? <Check className="h-3.5 w-3.5 shrink-0 text-plum" aria-hidden /> : <span className="text-gold-deep">0{i + 1}</span>}
                {/* Phones show only the current step's name */}
                <span className={cn("truncate", i !== step && "sr-only sm:not-sr-only")}>{s}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* overflow-x-clip (not hidden) so the sticky action bar below still sticks to the viewport */}
      <div className="relative overflow-x-clip rounded-[2rem] bg-sand/50 p-6 ring-1 ring-ink/5 sm:p-10">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 && <PhotosStep photos={form.photos} onChange={(p) => set("photos", p)} />}
            {step === 1 && <DetailsStep form={form} set={set} />}
            {step === 2 && <PricingStep form={form} set={set} />}
            {step === 3 && <AvailabilityStep selected={form.available} onChange={(a) => set("available", a)} />}
          </motion.div>
        </AnimatePresence>

        <div aria-live="assertive">
          {errors.length > 0 && (
            <ul className="mt-6 space-y-1 rounded-2xl bg-blush/70 p-4 text-sm text-plum-deep">
              {errors.map((e) => (
                <li key={e}>• {e}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="pb-safe sticky bottom-0 z-10 -mx-6 mt-10 flex items-center justify-between gap-3 border-t border-line bg-sand px-6 pt-3 sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:p-0 [&>*]:flex-1 sm:[&>*]:flex-none">
          <Button variant="secondary" onClick={() => go(step - 1)} disabled={step === 0} magnetic={false}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back
          </Button>
          {step < steps.length - 1 ? (
            <Button onClick={() => go(step + 1)}>
              Continue <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          ) : (
            <Button onClick={submit} variant="gold">
              Publish listing <Check className="h-4 w-4" aria-hidden />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepTitle({ title, hint }: { title: string; hint: string }) {
  return (
    <div className="mb-8">
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      <p className="mt-2 text-ink/70">{hint}</p>
    </div>
  );
}

function PhotosStep({ photos, onChange }: { photos: Photo[]; onChange: (p: Photo[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const camera = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const add = (files: FileList | null) => {
    if (!files) return;
    const next = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 8 - photos.length)
      .map((f) => ({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2)}`, url: URL.createObjectURL(f), name: f.name }));
    onChange([...photos, ...next]);
  };

  const remove = (id: string) => {
    const p = photos.find((x) => x.id === id);
    if (p) URL.revokeObjectURL(p.url);
    onChange(photos.filter((x) => x.id !== id));
  };

  return (
    <div>
      <StepTitle title="Show it off." hint="Up to 8 photos. Front, back and a close-up of the detailing get 3× more bookings." />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          add(e.dataTransfer.files);
        }}
        className={cn(
          "grid place-items-center rounded-[1.5rem] border-2 border-dashed px-6 py-12 text-center transition",
          drag ? "border-plum bg-blush/50" : "border-ink/15 bg-ivory"
        )}
      >
        <ImagePlus className="h-10 w-10 text-plum" strokeWidth={1.4} aria-hidden />
        <p className="mt-4 font-medium [@media(pointer:coarse)]:hidden">Drag photos here</p>
        <p className="text-sm text-muted [@media(pointer:coarse)]:hidden">or</p>
        <div className="mt-3 grid w-full max-w-sm gap-3 sm:grid-cols-2">
          {/* capture opens the rear camera directly on phones; desktops fall back to a file picker */}
          <button type="button" onClick={() => camera.current?.click()} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-plum px-5 font-semibold text-ivory">
            <Camera className="h-5 w-5" aria-hidden /> Take a photo
          </button>
          <button type="button" onClick={() => input.current?.click()} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-ivory px-5 font-semibold text-plum ring-1 ring-inset ring-plum/30">
            <ImagePlus className="h-5 w-5" aria-hidden /> Choose from device
          </button>
        </div>
        <input ref={input} type="file" accept="image/*" multiple className="sr-only" tabIndex={-1} onChange={(e) => add(e.target.files)} aria-label="Upload outfit photos" />
        <input ref={camera} type="file" accept="image/*" capture="environment" className="sr-only" tabIndex={-1} onChange={(e) => add(e.target.files)} aria-label="Take outfit photo" />
      </div>

      {photos.length > 0 && (
        <ul className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4">
          <AnimatePresence>
            {photos.map((p, i) => (
              <motion.li
                key={p.id}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-ivory ring-1 ring-ink/10"
              >
                {/* Local blob previews can't go through the image optimizer */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={`Upload preview ${i + 1}: ${p.name}`} className="absolute inset-0 h-full w-full object-cover" />
                {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold">Cover</span>}
                <button
                  type="button"
                  onClick={() => remove(p.id)}
                  aria-label={`Remove ${p.name}`}
                  className="absolute right-1 top-1 grid h-11 w-11 place-items-center rounded-full bg-ink/70 text-ivory transition hover:bg-plum"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

type Setter = <K extends keyof FormState>(k: K, v: FormState[K]) => void;

function DetailsStep({ form, set }: { form: FormState; set: Setter }) {
  const chip = (on: boolean) =>
    cn("rounded-full px-4 py-2 text-sm font-medium ring-1 transition", on ? "bg-plum text-ivory ring-plum" : "bg-ivory ring-ink/10 hover:ring-ink/30");
  return (
    <div>
      <StepTitle title="Tell us about it." hint="Honest details mean happy renters and five-star reviews." />
      <div className="grid gap-6 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-medium">Outfit name</span>
          <input className={field} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Emerald Kanjeevaram Saree" />
        </label>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Category</legend>
          <div className="flex gap-2">
            {(["Indian", "Western"] as const).map((c) => (
              <button type="button" key={c} aria-pressed={form.category === c} onClick={() => set("category", c)} className={chip(form.category === c)}>
                {c} wear
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-2 text-sm font-medium">Size</legend>
          <div className="flex flex-wrap gap-2">
            {SIZES.map((s) => (
              <button type="button" key={s} aria-pressed={form.size === s} onClick={() => set("size", s)} className={cn(chip(form.size === s), "w-12 px-0")}>
                {s}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium">Perfect for</legend>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => {
              const on = form.occasions.includes(o);
              return (
                <button
                  type="button"
                  key={o}
                  aria-pressed={on}
                  onClick={() => set("occasions", on ? form.occasions.filter((x) => x !== o) : [...form.occasions, o])}
                  className={chip(on)}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </fieldset>
        <label>
          <span className="mb-2 block text-sm font-medium">City</span>
          <select className={field} value={form.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">Select city</option>
            {content.cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-2 block text-sm font-medium">
            Description <span className="font-normal text-muted">(optional)</span>
          </span>
          <textarea
            className={cn(field, "h-28 resize-none py-3")}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={400}
            placeholder="Fabric, fit notes, how many times worn, what it pairs with…"
          />
          <span className="mt-1 block text-right text-xs text-muted">{form.description.length}/400</span>
        </label>
      </div>
    </div>
  );
}

function PricingStep({ form, set }: { form: FormState; set: Setter }) {
  const suggest = () => {
    const base = form.category === "Indian" ? 549 : 349;
    set("per4h", base);
    set("perDay", base * 2);
    set("per3Days", Math.round(base * 4.6));
    set("deposit", base * 4);
  };
  const rows: { key: "per4h" | "perDay" | "per3Days" | "deposit"; label: string; hint: string }[] = [
    { key: "per4h", label: "Per 4 hours", hint: "Great for interviews, shoots & dinners" },
    { key: "perDay", label: "Per day", hint: "Most popular for parties & functions" },
    { key: "per3Days", label: "Per 3 days", hint: "Weddings & long weekends" },
    { key: "deposit", label: "Security deposit", hint: "Refunded to the renter after a safe return" },
  ];
  return (
    <div>
      <StepTitle title="Name your price." hint="You keep 85% of every rental. We handle cleaning, delivery and protection." />
      <button type="button" onClick={suggest} className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-gold/20 px-4 text-sm font-semibold text-ink hover:bg-gold/30">
        <Wand2 className="h-4 w-4" aria-hidden /> Suggest prices for me
      </button>
      <div className="grid gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <label key={r.key} className="rounded-2xl bg-ivory p-5 ring-1 ring-ink/5">
            <span className="block text-sm font-medium">{r.label}</span>
            <span className="block text-xs text-muted">{r.hint}</span>
            <span className="mt-3 flex items-center gap-2">
              <span className="font-display text-2xl text-muted">₹</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={50}
                value={form[r.key]}
                onChange={(e) => set(r.key, Math.max(0, Number(e.target.value)))}
                className="w-full bg-transparent font-display text-3xl focus:outline-none"
              />
            </span>
          </label>
        ))}
      </div>
      <p className="surface-dark mt-6 rounded-2xl bg-plum p-5 text-ivory">
        At 3 day-rentals a month you&apos;d earn <strong className="text-gold">{formatINR(form.perDay * 3 * (1 - PLATFORM_CUT))}</strong>. Not bad for
        something that was sitting in a cupboard.
      </p>
    </div>
  );
}

function AvailabilityStep({ selected, onChange }: { selected: string[]; onChange: (a: string[]) => void }) {
  const [offset, setOffset] = useState(0);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const { label, cells } = useMemo(() => {
    if (!now) return { label: "", cells: [] as (Date | null)[] };
    const first = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const pad = (first.getDay() + 6) % 7; // Monday-first
    const list: (Date | null)[] = Array.from({ length: pad }, () => null);
    for (let d = 1; d <= days; d++) list.push(new Date(first.getFullYear(), first.getMonth(), d));
    return { label: first.toLocaleDateString("en-IN", { month: "long", year: "numeric" }), cells: list };
  }, [now, offset]);

  const todayKey = now ? ymd(now) : "";
  const toggle = (k: string) => onChange(selected.includes(k) ? selected.filter((x) => x !== k) : [...selected, k]);
  const selectWeekends = () => {
    const weekends = cells.filter((d): d is Date => !!d && (d.getDay() === 0 || d.getDay() === 6) && ymd(d) >= todayKey).map(ymd);
    onChange(Array.from(new Set([...selected, ...weekends])));
  };

  return (
    <div>
      <StepTitle title="When is it free?" hint="Tap days your outfit can be rented. You can always block dates later." />
      <div className="rounded-[1.5rem] bg-ivory p-5 ring-1 ring-ink/5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => setOffset((o) => Math.max(0, o - 1))} disabled={offset === 0} aria-label="Previous month" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand disabled:opacity-30">
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <p className="font-display text-xl" aria-live="polite">
            {label}
          </p>
          <button type="button" onClick={() => setOffset((o) => Math.min(5, o + 1))} aria-label="Next month" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand">
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-muted" aria-hidden>
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <span key={d} className="py-2">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <span key={`pad-${i}`} />;
            const k = ymd(d);
            const past = k < todayKey;
            const on = selected.includes(k);
            return (
              <button
                type="button"
                key={k}
                disabled={past}
                aria-pressed={on}
                aria-label={`${d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}${on ? ", available" : ""}`}
                onClick={() => toggle(k)}
                className={cn(
                  "aspect-square rounded-xl text-sm font-medium transition",
                  past && "cursor-not-allowed text-ink/25",
                  !past && !on && "hover:bg-sand",
                  on && "bg-plum text-ivory",
                  k === todayKey && !on && "ring-1 ring-gold"
                )}
              >
                {d.getDate()}
              </button>
            );
          })}
        </div>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-sm">
          <span className="text-muted">{selected.length} days available</span>
          <div className="flex gap-2">
            <button type="button" onClick={selectWeekends} className="min-h-11 rounded-full bg-sand px-4 font-medium hover:bg-blush">
              All weekends this month
            </button>
            {selected.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="min-h-11 rounded-full px-4 font-medium text-plum hover:bg-sand">
                Clear
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
