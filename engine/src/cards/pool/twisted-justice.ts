import { defineCard } from "../define.js";

// Ravnica: City of Guilds (RAV). The draw reads the sacrificed creature's power as it last existed
// (Grab the Reins' shape).

export default defineCard({
  name: "Twisted Justice",
  manaCost: "{4}{U}{B}",
  colors: ["U", "B"],
  types: ["sorcery"],
  text: "Target player sacrifices a creature of their choice. You draw cards equal to that creature's power.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "sacrifice", who: "target", filter: { type: "creature" }, count: 1 },
      { kind: "draw", amount: { thisWay: "sacrificed", sumOf: "power" } },
    ],
  },
});
