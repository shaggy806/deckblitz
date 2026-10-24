import { defineCard } from "../define.js";

export default defineCard({
  name: "Lava Coil",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Lava Coil deals 4 damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 4, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
