import { defineCard } from "../define.js";

// EDHREC rank 13425. Its ruling: +X/+0, X its power as this resolves.

export default defineCard({
  name: "Double Trouble",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Double the power of each creature you control until end of turn.",
  targets: [],
  effect: {
    kind: "double-pt-all",
    filter: { type: "creature", controlledBy: "you" },
    duration: "end-of-turn",
    powerOnly: true,
  },
});
