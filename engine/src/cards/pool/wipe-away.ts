import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 15098.
export default defineCard({
  name: "Wipe Away",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  splitSecond: true,
  text: "Split second (As long as this spell is on the stack, players can't cast spells or activate abilities that aren't mana abilities.)\nReturn target permanent to its owner's hand.",
  targets: ["permanent"],
  effect: { kind: "return-to-hand", target: 0 },
});
