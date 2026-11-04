import { defineCard } from "../define.js";

// "A commander" is any of them, added up: the target player's own count (rule
// 903.8), for a player with none, 0.

const TEXT =
  "Target player draws X cards plus an additional card for each time they've cast a commander from the command zone this game.";

export default defineCard({
  name: "Commander's Insight",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["player"],
  effect: { kind: "draw", target: 0, amount: { sum: ["x", { commanderCasts: 0 }] } },
});
