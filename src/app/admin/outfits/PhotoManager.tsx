"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { photoUrl } from "@/lib/supabase/env";
import { photosChanged } from "../actions";
import { btn } from "../ui";

interface Photo {
  id: string;
  path: string;
  alt: string;
  position: number;
}

const MAX_EDGE = 1600;

/** Phone photos are 3–8 MB; this shrinks them to ~300 KB JPEGs before upload, keeping the free storage and the pages light */
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Couldn't read this image"))), "image/jpeg", 0.85));
}

export function PhotoManager({ outfitId, outfitName, photos }: { outfitId: string; outfitName: string; photos: Photo[] }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  async function done() {
    await photosChanged();
    router.refresh();
    setBusy("");
  }

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    const sb = supabaseBrowser();
    setError("");
    let position = photos.length ? Math.max(...photos.map((p) => p.position)) + 1 : 0;
    const list = Array.from(files);
    for (const [i, file] of list.entries()) {
      setBusy(`Uploading ${i + 1} of ${list.length}…`);
      try {
        const blob = await shrink(file);
        const path = `${outfitId}/${crypto.randomUUID()}.jpg`;
        const up = await sb.storage.from("outfit-photos").upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
        if (up.error) throw up.error;
        const row = await sb.from("outfit_photos").insert({ outfit_id: outfitId, path, alt: outfitName, position: position++ });
        if (row.error) throw row.error;
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "upload failed"}`);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
    await done();
  }

  async function remove(p: Photo) {
    if (!confirm("Delete this photo?")) return;
    setBusy("Deleting…");
    const sb = supabaseBrowser();
    await sb.storage.from("outfit-photos").remove([p.path]);
    await sb.from("outfit_photos").delete().eq("id", p.id);
    await done();
  }

  async function makeCover(p: Photo) {
    setBusy("Saving…");
    const sb = supabaseBrowser();
    const order = [p, ...photos.filter((x) => x.id !== p.id)];
    await Promise.all(order.map((x, i) => sb.from("outfit_photos").update({ position: i }).eq("id", x.id)));
    await done();
  }

  return (
    <div className="mt-4">
      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5">
        {photos.map((p, i) => (
          <li key={p.id} className="relative aspect-[3/4] overflow-hidden rounded-xl bg-sand">
            <Image src={photoUrl(p.path)} alt={p.alt} fill sizes="200px" className="object-cover" />
            {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-xs text-ivory">Cover</span>}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink/60 p-1.5">
              {i > 0 && (
                <button type="button" onClick={() => makeCover(p)} disabled={!!busy} aria-label="Make cover photo" className="grid h-9 w-9 place-items-center rounded-full bg-ivory/90">
                  <Star className="h-4 w-4" aria-hidden />
                </button>
              )}
              <button type="button" onClick={() => remove(p)} disabled={!!busy} aria-label="Delete photo" className="grid h-9 w-9 place-items-center rounded-full bg-ivory/90 text-red-700">
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" id="photo-input" onChange={(e) => upload(e.target.files)} />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="photo-input" className={`${btn.secondary} cursor-pointer ${busy ? "pointer-events-none opacity-50" : ""}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
          {busy || "Add photos"}
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-800">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
