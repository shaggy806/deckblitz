import { defineCard } from "../define.js";

export default defineCard({
  name: "Stern Lesson",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Draw two cards, then discard a card. Create a tapped Powerstone token. (It's an artifact with \"{T}: Add {C}. This mana can't be spent to cast a nonartifact spell.\")",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 2 }, { kind: "discard", target: "you", amount: 1 }],
      },
      { kind: "create-token", token: "Powerstone Token", count: 1, tapped: true },
    ],
  },
});
