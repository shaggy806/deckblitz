import { defineCard } from "../define.js";

// EDHREC rank 12236.
// Makes Elemental → "5/5 Elemental Token" (red and green).
//
// Each number is read as its step happens: the colors among your permanents
// as the tokens are made, then the creatures you control — the new
// Elementals among them — for the life.

const TEXT =
  "Vivid — Create a number of 5/5 red and green Elemental creature tokens equal to the number of colors among permanents you control. Then you gain life equal to the number of creatures you control.";

export default defineCard({
  name: "Elemental Spectacle",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "5/5 Elemental Token", count: { colorsAmong: { controlledBy: "you" } } },
      { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
    ],
  },
});
