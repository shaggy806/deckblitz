import { defineCard } from "../define.js";

export default defineCard({
  name: "Puncture Blast",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["instant"],
  keywords: ["wither"],
  text: "Wither (This deals damage to creatures in the form of -1/-1 counters.)\nPuncture Blast deals 3 damage to any target.",
  targets: ["any-target"],
  effect: { kind: "damage", amount: 3, target: 0 },
});
