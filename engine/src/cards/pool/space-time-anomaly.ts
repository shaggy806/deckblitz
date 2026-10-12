import { defineCard } from "../define.js";

// EDHREC rank 7033.
//
// "Equal to your life total" is the caster's life as it resolves, whichever
// player is milled.

export default defineCard({
  name: "Space-Time Anomaly",
  manaCost: "{2}{W}{U}",
  colors: ["W", "U"],
  types: ["sorcery"],
  text: "Target player mills cards equal to your life total.",
  targets: ["player"],
  effect: { kind: "mill", target: 0, amount: { lifeTotal: "you" } },
});
