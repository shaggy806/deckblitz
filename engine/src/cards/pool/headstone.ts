import { defineCard } from "../define.js";

export default defineCard({
  name: "Headstone",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Exile target card from a graveyard.\nDraw a card at the beginning of the next turn's upkeep.",
  targets: [{ kind: "card-in-graveyard", whose: "any" }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "delayed-trigger",
        at: "next-upkeep",
        effect: { kind: "draw", amount: 1 },
        text: "Draw a card.",
      },
    ],
  },
});
