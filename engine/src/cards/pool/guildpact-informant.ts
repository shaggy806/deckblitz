import { defineCard } from "../define.js";

const TEXT = "Whenever this creature deals combat damage to a player or planeswalker, proliferate.";

// An attacker deals its combat damage to the one player or planeswalker it
// attacks, so the two halves never fire for the same damage (Grateful
// Apparition's shape).
export default defineCard({
  name: "Guildpact Informant",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Faerie", "Rogue"],
  power: 1,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${TEXT} (Choose any number of permanents and/or players, then give each another counter of each kind already there.)`,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player", combat: true },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "planeswalker", combat: true },
      targets: [],
      effect: { kind: "proliferate" },
      resolve: null,
      text: TEXT,
    },
  ],
});
