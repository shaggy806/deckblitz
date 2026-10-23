import { defineCard } from "../define.js";

export default defineCard({
  name: "Scorchmark",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Scorchmark deals 2 damage to target creature. If that creature would die this turn, exile it instead.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [{ kind: "damage", amount: 2, target: 0 }, { kind: "exile-if-dies-this-turn", target: 0 }],
  },
});
