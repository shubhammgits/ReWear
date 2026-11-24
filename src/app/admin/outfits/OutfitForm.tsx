import Link from "next/link";
import { OCCASIONS, SIZES } from "@/lib/api";
import type { OutfitRow } from "@/lib/catalog";
import { PROTECTION_FEE, SERVICE_FEE_RATE } from "@/lib/pricing";
import { saveOutfit } from "../actions";
import { Card, Field, btn, input } from "../ui";

const TYPES = ["Lehenga", "Saree", "Anarkali", "Sharara", "Kurta set", "Sherwani", "Indo-western", "Gown", "Dress", "Co-ord set", "Suit", "Blazer"];

export function OutfitForm({ outfit, lenders }: { outfit?: OutfitRow; lenders: { id: string; name: string }[] }) {
  return (
    <form action={saveOutfit} className="grid gap-6">
      {outfit && <input type="hidden" name="id" value={outfit.id} />}
      <Card className="grid gap-4 sm:grid-cols-2">
        <Field label="Outfit name" className="sm:col-span-2" hint="What renters see, e.g. Blush Organza Lehenga">
          <input name="name" required defaultValue={outfit?.name} className={input} />
        </Field>
        <Field label="Owner (lender)">
          <select name="lender_id" required defaultValue={outfit?.lender_id ?? ""} className={input}>
            <option value="" disabled>
              Choose…
            </option>
            {lenders.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category">
          <select name="category" defaultValue={outfit?.category ?? "Indian"} className={input}>
            <option>Indian</option>
            <option>Western</option>
          </select>
        </Field>
        <Field label="Type">
          <input name="type" required list="outfit-types" defaultValue={outfit?.type} className={input} />
          <datalist id="outfit-types">
            {TYPES.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </Field>
        <Field label="Size">
          <select name="size" defaultValue={outfit?.size ?? "M"} className={input}>
            {SIZES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Measurements" className="sm:col-span-2" hint="Helps renters check fit, e.g. Bust 36in, waist 30in, length 42in">
          <input name="measurements" defaultValue={outfit?.measurements ?? ""} className={input} />
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="mb-1.5 text-sm font-medium text-ink/80">Occasions</legend>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <label key={o} className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 text-sm ring-1 ring-ink/15 has-[:checked]:bg-plum has-[:checked]:text-ivory has-[:checked]:ring-plum">
                <input type="checkbox" name="occasions" value={o} defaultChecked={outfit?.occasions.includes(o)} className="sr-only" />
                {o}
              </label>
            ))}
          </div>
        </fieldset>
        <Field label="Description" className="sm:col-span-2" hint="Condition, what's included (dupatta, blouse), how it fits">
          <textarea name="description" rows={4} defaultValue={outfit?.description} className={`${input} h-auto py-2`} />
        </Field>
        <Field label="Fabric">
          <input name="fabric" defaultValue={outfit?.fabric ?? ""} className={input} />
        </Field>
        <Field label="Colour">
          <input name="color" defaultValue={outfit?.color ?? ""} className={input} />
        </Field>
      </Card>

      <Card>
        <h3 className="text-lg">Prices</h3>
        <p className="mt-1 text-sm text-muted">
          The lender&apos;s prices. Renters also pay a {Math.round(SERVICE_FEE_RATE * 100)}% service fee, the cleaning fee and ₹{PROTECTION_FEE} damage
          protection.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="4 hours (₹)">
            <input name="price_4h" type="number" min={1} required inputMode="numeric" defaultValue={outfit?.price_4h} className={input} />
          </Field>
          <Field label="1 day (₹)">
            <input name="price_day" type="number" min={1} required inputMode="numeric" defaultValue={outfit?.price_day} className={input} />
          </Field>
          <Field label="3 days (₹)">
            <input name="price_3days" type="number" min={1} required inputMode="numeric" defaultValue={outfit?.price_3days} className={input} />
          </Field>
          <Field label="Cleaning fee (₹)">
            <input name="cleaning_fee" type="number" min={0} required inputMode="numeric" defaultValue={outfit?.cleaning_fee ?? 199} className={input} />
          </Field>
        </div>
        <label className="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" name="featured" defaultChecked={outfit?.featured} className="h-5 w-5 accent-plum" />
          Feature on the home page
        </label>
      </Card>

      <div className="flex flex-wrap gap-2">
        <button className={btn.primary}>{outfit ? "Save changes" : "Save and add photos"}</button>
        <Link href="/admin/outfits" className={btn.secondary}>
          Back to outfits
        </Link>
      </div>
    </form>
  );
}
