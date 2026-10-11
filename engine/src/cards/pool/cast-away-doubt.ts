import { defineCard } from "../define.js";

export default defineCard({
  name: "Cast Away Doubt",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Draw two cards. Cast Away Doubt deals 2 damage to each player.",
  effect: {
    kind: "sequence",
    effects: [{ kind: "draw", amount: 2 }, { kind: "damage", amount: 2, who: "each-player" }],
  },
});
