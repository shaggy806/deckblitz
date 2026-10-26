import { defineCard } from "../define.js";

// EDHREC rank 13330.
//
// Rulings:
//   [2017-11-17] Hypersonic Dragon's last ability has no effect on abilities that you can activate
//     "any time you could cast a sorcery."
//   [2017-11-17] Hypersonic Dragon's last ability applies to sorcery cards in any zone, provided
//     something is allowing you to cast them. For example, you could cast a sorcery with flashback
//     as though it had flash.

const FLASH_TEXT = "You may cast sorcery spells as though they had flash.";

export default defineCard({
  name: "Hypersonic Dragon",
  manaCost: "{3}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 4,
  keywords: ["flying", "haste"],
  text: "Flying, haste\nYou may cast sorcery spells as though they had flash. (You may cast them any time you could cast an instant.)",
  static: [{ affects: { scope: "self" }, castAsThoughFlash: { type: "sorcery" }, text: FLASH_TEXT }],
});
