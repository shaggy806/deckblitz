import { defineCard } from "../define.js";

export default defineCard({
  name: "Crushing Disappointment",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Each player loses 2 life. You draw two cards.",
  effect: {
    kind: "sequence",
    effects: [{ kind: "lose-life", amount: 2, who: "each-player" }, { kind: "draw", amount: 2 }],
  },
});
