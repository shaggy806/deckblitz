import { defineCard } from "../define.js";

// The back face of Kessig Prowler.
const BLOCK_TEXT = "This creature can't be blocked by more than one creature.";

export default defineCard({
  name: "Sinuous Predator",
  art: "https://cards.scryfall.io/art_crop/back/f/8/f89f116a-1e8e-4ae7-be39-552e4954f229.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 4,
  toughness: 4,
  text: BLOCK_TEXT,
  static: [{ affects: { scope: "self" }, blockedByAtMostOne: true, text: BLOCK_TEXT }],
  faces: ["Kessig Prowler", "Sinuous Predator"],
  transform: true,
});
