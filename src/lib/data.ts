/**
 * Static catalog data transcribed verbatim from `Paradise Plan.dc.html`.
 * Destinations, the wizard option sets, and the per-destination base price map.
 */

export interface Destination {
  key: string;
  name: string;
  imageSrc: string;
  region: string;
  nights: number;
  tags: string[];
  weather: string;
  intensity: number;
  rating: string;
  airline: string;
  hotel: string;
  room: string;
  activity: string;
  actDesc: string;
  blurb: string;
  gradient: string;
  from: string;
  to: string;
  departsIn: number;
  seats: number;
  slotHint: string;
}

export const CITIES = [
  "Mexico City",
  "Monterrey",
  "Guadalajara",
  "New York",
  "Los Angeles",
];

export const WHEN = ["Flexible", "This summer", "Jul", "Aug", "Sep", "Dec"];

export const PACKAGES = ["Flight", "Hotel", "Activity", "Car", "Cruise", "Boat"];

export const VACATION = [
  "Family",
  "Friends",
  "Adventure",
  "Discovery",
  "Lone wolf",
];

export const TRAVELER_TYPES = ["Adult", "Children", "Senior"];

export const GENERAL = [
  "Beach",
  "Nightlife",
  "Activities",
  "Museums",
  "Historic",
  "Good food",
  "Nature",
  "Luxury",
  "Hidden",
  "Touristic staples",
  "Cruises",
];

export const WEATHER = ["Hot", "Cold", "Windy", "Perfect", "Mild", "Snow"];

export const DESTS: Destination[] = [
  {
    key: "cancun",
    name: "Cancún",
    imageSrc: "/images/trips/cancun.webp",
    region: "Quintana Roo, MX",
    nights: 3,
    tags: ["Beach", "Nightlife", "Touristic staples"],
    weather: "Hot",
    intensity: 2,
    rating: "4.9",
    airline: "jetBlue",
    hotel: "Real Inn Cancún",
    room: "2 queen beds",
    activity: "Steve Aoki live",
    actDesc: "Beach-club concert",
    blurb:
      "The Caribbean playground of beach lovers and night owls. Turquoise water by day, headline sets by night.",
    gradient: "linear-gradient(140deg,#22B5C9,#3FD0C2 48%,#F0C04A)",
    from: "CDMX",
    to: "CUN",
    departsIn: 18,
    seats: 4,
    slotHint: "Drop a Cancún photo",
  },
  {
    key: "tulum",
    name: "Tulum",
    imageSrc: "/images/trips/tulum.webp",
    region: "Quintana Roo, MX",
    nights: 4,
    tags: ["Beach", "Hidden", "Luxury"],
    weather: "Hot",
    intensity: 2,
    rating: "4.8",
    airline: "Aeroméxico",
    hotel: "Habitas Tulum",
    room: "Jungle suite",
    activity: "Cenote dive",
    actDesc: "Cenote + beach club",
    blurb: "Bohemian beaches, secret cenotes, and slow luxury under the palms.",
    gradient: "linear-gradient(140deg,#0E9E8E,#5BC98A 55%,#E9D27E)",
    from: "CDMX",
    to: "CUN",
    departsIn: 24,
    seats: 6,
    slotHint: "Drop a Tulum photo",
  },
  {
    key: "oaxaca",
    name: "Oaxaca",
    imageSrc: "/images/trips/oaxaca.webp",
    region: "Oaxaca, MX",
    nights: 3,
    tags: ["Good food", "Historic", "Hidden"],
    weather: "Perfect",
    intensity: 3,
    rating: "4.9",
    airline: "Volaris",
    hotel: "Casa Antonieta",
    room: "Courtyard room",
    activity: "Mezcal tasting",
    actDesc: "Mezcal + mole tour",
    blurb:
      "Mezcal, mole, and the warmest streets in Mexico. A feast in every direction.",
    gradient: "linear-gradient(140deg,#E8632B,#F0A027 55%,#F7C65A)",
    from: "CDMX",
    to: "OAX",
    departsIn: 12,
    seats: 8,
    slotHint: "Drop an Oaxaca photo",
  },
  {
    key: "lisbon",
    name: "Lisbon",
    imageSrc: "/images/trips/lisbon.webp",
    region: "Portugal",
    nights: 5,
    tags: ["Historic", "Good food", "Nightlife", "Museums"],
    weather: "Perfect",
    intensity: 3,
    rating: "4.7",
    airline: "TAP Air",
    hotel: "Memmo Alfama",
    room: "City-view king",
    activity: "Fado night",
    actDesc: "Fado + tram tour",
    blurb: "Tiled hills, ocean light, and late dinners that drift into music.",
    gradient: "linear-gradient(140deg,#F08A3C,#F2B25A 50%,#3FB6C9)",
    from: "CDMX",
    to: "LIS",
    departsIn: 31,
    seats: 5,
    slotHint: "Drop a Lisbon photo",
  },
  {
    key: "cruise",
    name: "Caribbean Cruise",
    imageSrc: "/images/trips/caribbean-cruise.webp",
    region: "7-night sailing",
    nights: 7,
    tags: ["Cruises", "Beach", "Luxury"],
    weather: "Hot",
    intensity: 1,
    rating: "4.8",
    airline: "Fly + sail",
    hotel: "Ocean-view stateroom",
    room: "Balcony cabin",
    activity: "5 islands",
    actDesc: "5 ports + shows",
    blurb:
      "Five islands, zero unpacking. Wake up somewhere new every morning.",
    gradient: "linear-gradient(140deg,#1577B8,#1FB0C9 55%,#7FD9CF)",
    from: "CDMX",
    to: "Port",
    departsIn: 21,
    seats: 3,
    slotHint: "Drop a cruise photo",
  },
  {
    key: "patagonia",
    name: "Patagonia",
    imageSrc: "/images/trips/patagonia.webp",
    region: "Chile",
    nights: 6,
    tags: ["Nature", "Activities"],
    weather: "Cold",
    intensity: 5,
    rating: "4.9",
    airline: "LATAM",
    hotel: "EcoCamp domes",
    room: "Suite dome",
    activity: "Paine trek",
    actDesc: "Torres del Paine trek",
    blurb: "Glaciers, granite towers, and the kind of silence you can hear.",
    gradient: "linear-gradient(140deg,#1F8E6E,#4FB58C 55%,#9AD0C0)",
    from: "CDMX",
    to: "PUQ",
    departsIn: 38,
    seats: 4,
    slotHint: "Drop a Patagonia photo",
  },
];

/** Per-destination base price (USD), keyed by destination `key`. */
export const DEST_BASE: Record<string, number> = {
  cancun: 540,
  tulum: 720,
  oaxaca: 380,
  lisbon: 880,
  cruise: 690,
  patagonia: 1340,
};

export const HOW_IT_WORKS = [
  {
    n: "1",
    title: "Plug in your trip",
    body: "Departure, dates, budget, packages, and who is going.",
  },
  {
    n: "2",
    title: "Pick your preferences",
    body: "Beach, nightlife, nature, food, and the weather you want.",
  },
  {
    n: "3",
    title: "Get a surprise package",
    body: "A ready-to-book trip with the best deal for you.",
  },
];

export const PROVIDER = "Expedia";
