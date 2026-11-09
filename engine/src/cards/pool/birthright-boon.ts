import { defineCard } from "../define.js";

// The Adventure half of Kellan, the Fae-Blooded.

export default defineCard({
  name: "Birthright Boon",
  art: "https://cards.scryfall.io/art_crop/back/e/c/ec5e2680-8b42-4571-ab45-4936aec51901.jpg",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  subtypes: ["Adventure"],
  text: "Search your library for an Aura or Equipment card, reveal it, put it into your hand, then shuffle.",
  targets: [],
  effect: { kind: "search-library", filter: { subtypes: ["Aura", "Equipment"] }, destination: "hand", min: 0, max: 1, reveal: true },
  faces: ["Kellan, the Fae-Blooded", "Birthright Boon"],
  adventure: true,
});
