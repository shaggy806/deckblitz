import { defineCard } from "../define.js";

export default defineCard({
  name: "Bot Bashing Time",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Bot Bashing Time deals 6 damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 6, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
