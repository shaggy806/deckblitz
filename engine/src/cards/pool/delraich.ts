import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 27714.

export default defineCard({
  name: "Delraich",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Horror"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "You may sacrifice three black creatures rather than pay this spell's mana cost.\nTrample",
  alternativeCost: { mana: "{0}", sacrifice: { filter: { type: "creature", colors: ["B"] }, count: 3, text: "three black creatures" } },
});
