import { defineCard } from "../define.js";

export default defineCard({
  name: "Lavalanche",
  manaCost: "{X}{B}{R}{G}",
  colors: ["B", "R", "G"],
  types: ["sorcery"],
  text: "Lavalanche deals X damage to target player or planeswalker and each creature that player or that planeswalker's controller controls.",
  targets: ["player-or-planeswalker"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount: "x", target: 0 },
      { kind: "damage-all", filter: { type: "creature" }, amount: "x", controlledByTarget: 0 },
    ],
  },
});
