import { defineCard } from "../define.js";

// EDHREC rank 17199.

export default defineCard({
  name: "Dominate",
  manaCost: "{X}{1}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Gain control of target creature with mana value X or less.",
  targets: [{ kind: "permanent", filter: { type: "creature", manaValue: { op: "lte", n: "x" } } }],
  effect: { kind: "gain-control", target: 0, untilEndOfTurn: false },
});
