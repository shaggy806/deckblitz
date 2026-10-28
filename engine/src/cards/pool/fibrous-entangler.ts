import { defineCard } from "../define.js";

// Tangleclaw Werewolf's back face.
//
// Rulings:
//   The defending player, not you, chooses which creature blocks Fibrous Entangler.
//   Only one creature is required to block Fibrous Entangler. Other creatures may also block it,
//     and are free to block other creatures or not block at all.
//   If Tangleclaw Werewolf transforms into Fibrous Entangler while it's attacking, having vigilance
//     won't cause it to become untapped.

const LURE_TEXT = "This creature must be blocked if able.";
const BLOCK_TEXT = "This creature can block an additional creature each combat.";

export default defineCard({
  name: "Fibrous Entangler",
  art: "https://cards.scryfall.io/art_crop/back/e/e/ee648500-a213-4aa4-a97c-b7223c11bebd.jpg",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi", "Werewolf"],
  power: 4,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${LURE_TEXT}\n${BLOCK_TEXT}`,
  static: [
    { affects: { scope: "self" }, restrictions: ["must-be-blocked-if-able"], text: LURE_TEXT },
    { affects: { scope: "self" }, blockAdditional: 1, text: BLOCK_TEXT },
  ],
  faces: ["Tangleclaw Werewolf", "Fibrous Entangler"],
  transform: true,
});
