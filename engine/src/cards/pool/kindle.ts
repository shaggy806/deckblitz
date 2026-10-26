import { defineCard } from "../define.js";

// Tempest (TMP). EDHREC rank 31892. Every graveyard counts; Kindle itself is
// still on the stack as it resolves, so it never counts itself (the
// 2018-03-16 ruling).

export default defineCard({
  name: "Kindle",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Kindle deals X damage to any target, where X is 2 plus the number of cards named Kindle in all graveyards.",
  targets: ["any-target"],
  effect: { kind: "damage", target: 0, amount: { sum: [2, { countInGraveyard: { name: "Kindle" } }] } },
});
