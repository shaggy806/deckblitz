import { defineCard } from "../define.js";

// EDHREC rank 10962.

export default defineCard({
  name: "Fiery Cannonade",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Fiery Cannonade deals 2 damage to each non-Pirate creature.",
  targets: [],
  effect: { kind: "damage-all", amount: 2, filter: { type: "creature", notSubtypes: ["Pirate"] } },
});
