import { defineCard } from "../define.js";

// Mercadian Masques (MMQ). EDHREC rank 15906.
//
// The sacrifice-a-Mountain alternative cost, as Crash's.

export default defineCard({
  name: "Thunderclap",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may sacrifice a Mountain rather than pay this spell's mana cost.\nThunderclap deals 3 damage to target creature.",
  alternativeCost: { mana: "{0}", sacrifice: { filter: { type: "land", subtype: "Mountain" }, text: "a Mountain" } },
  targets: ["creature"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
