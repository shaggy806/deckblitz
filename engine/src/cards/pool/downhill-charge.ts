import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 12357.
//
// "You may sacrifice a Mountain rather than pay this spell's mana cost" (rule
// 118.9, Crash's). X is counted as it resolves (608.2h), so a Mountain
// sacrificed for it doesn't count.

const MOUNTAINS = { countOf: { type: "land", subtype: "Mountain", controlledBy: "you" } } as const;

export default defineCard({
  name: "Downhill Charge",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may sacrifice a Mountain rather than pay this spell's mana cost.\nTarget creature gets +X/+0 until end of turn, where X is the number of Mountains you control.",
  alternativeCost: { mana: "{0}", sacrifice: { filter: { type: "land", subtype: "Mountain" }, text: "a Mountain" } },
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: MOUNTAINS, toughness: 0, duration: "end-of-turn" },
});
