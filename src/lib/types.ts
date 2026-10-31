export type OccasionName =
  | "Wedding"
  | "Party"
  | "Festival"
  | "Interview"
  | "Photoshoot"
  | "Date night";

export type Size = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface Pricing {
  /** Price for the first 4-hour block */
  per4h: number;
  perDay: number;
  per3Days: number;
}

export interface Item {
  id: string;
  name: string;
  category: "Indian" | "Western";
  type: string;
  occasions: OccasionName[];
  size: Size;
  city: string;
  rating: number;
  reviewsCount: number;
  images: string[];
  imageAlt: string;
  description: string;
  fabric: string;
  color: string;
  pricing: Pricing;
  deposit: number;
  cleaningFee: number;
  lenderId: string;
  featured?: boolean;
}

export interface Lender {
  id: string;
  name: string;
  avatar: string;
  city: string;
  verified: boolean;
  rating: number;
  rentals: number;
  joined: string;
  responseTime: string;
  bio: string;
}

export interface Review {
  id: string;
  itemId?: string;
  name: string;
  avatar: string;
  city: string;
  rating: number;
  occasion: OccasionName;
  text: string;
  date: string;
}

export interface Occasion {
  name: OccasionName;
  tagline: string;
  image: string;
  alt: string;
}

export interface Faq {
  q: string;
  a: string;
}

export type DurationUnit = "hours" | "days";
