import { defineCard } from "../define.js";

// Champions of Kamigawa (CHK). EDHREC rank 21235.

export default defineCard({
  name: "Crushing Pain",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  subtypes: ["Arcane"],
  text: "Crushing Pain deals 6 damage to target creature that was dealt damage this turn.",
  targets: [{ kind: "permanent", whose: "any", filter: { type: "creature", damagedThisTurnBy: {} } }],
  effect: { kind: "damage", amount: 6, target: 0 },
});
