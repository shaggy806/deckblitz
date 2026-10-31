import { defineCard } from "../define.js";

// "That much" is the counters removed this way — a player's count too (rule
// 122.1, the `thisWay: "counters-removed"` amount).
export default defineCard({
  name: "Leeches",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Target player loses all poison counters. Leeches deals that much damage to that player.",
  targets: ["player"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "remove-player-counters", counter: "poison", amount: "all", target: 0 },
      { kind: "damage", amount: { thisWay: "counters-removed" }, target: 0 },
    ],
  },
});
