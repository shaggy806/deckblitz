import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 14050.

export default defineCard({
  name: "Sudden Shock",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nSudden Shock deals 2 damage to any target.",
  splitSecond: true,
  targets: ["any-target"],
  effect: { kind: "damage", amount: 2, target: 0 },
});
