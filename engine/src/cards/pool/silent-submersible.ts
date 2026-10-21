import { defineCard } from "../define.js";
import { crew } from "../helpers.js";

const TEXT = "Whenever this Vehicle deals combat damage to a player or planeswalker, draw a card.";

// An attacker deals its combat damage to the one player or planeswalker it
// attacks, so the two halves never fire for the same damage (Grateful
// Apparition's shape).
export default defineCard({
  name: "Silent Submersible",
  manaCost: "{U}{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 2,
  toughness: 3,
  text: `${TEXT}\nCrew 2 (Tap any number of creatures you control with total power 2 or more: This Vehicle becomes an artifact creature until end of turn.)`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "player", combat: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
    {
      trigger: { on: "deals-damage", who: "self", to: "planeswalker", combat: true },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
