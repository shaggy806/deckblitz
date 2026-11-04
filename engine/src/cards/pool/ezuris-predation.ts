import { defineCard } from "../define.js";

export default defineCard({
  name: "Ezuri's Predation",
  manaCost: "{5}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "For each creature your opponents control, create a 4/4 green Phyrexian Beast creature token. Each of those tokens fights a different one of those creatures.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "create-token",
        token: "Phyrexian Beast Token (Ezuri's Predation)",
        count: { countOf: { type: "creature", controlledBy: "opponent" } },
      },
      { kind: "created-tokens-fight", among: { type: "creature", controlledBy: "opponent" } },
    ],
  },
});
