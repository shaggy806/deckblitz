import { defineCard } from "../define.js";

// EDHREC rank 25367. Chandra's Triumph's "Chandra planeswalker" filter, as an
// intervening-if (rule 603.4).

const TEXT = "Whenever this creature attacks, if you control a Chandra planeswalker, this creature deals 2 damage to any target.";

export default defineCard({
  name: "Karplusan Hound",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dog"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "controls", filter: { type: "planeswalker", subtype: "Chandra" }, atLeast: 1 },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
