import { defineCard } from "../define.js";

export default defineCard({
  name: "Sami's Curiosity",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You gain 2 life. Create a Lander token. (It's an artifact with \"{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.\")",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "gain-life", amount: 2 },
      { kind: "create-token", token: "Lander Token", count: 1 },
    ],
  },
});
