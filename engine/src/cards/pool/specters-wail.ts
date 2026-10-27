import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 29018. Sanity Gnawers' discard as a
// sorcery.

export default defineCard({
  name: "Specter's Wail",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target player discards a card at random.",
  targets: ["player"],
  effect: { kind: "discard", target: 0, amount: 1, random: true },
});
