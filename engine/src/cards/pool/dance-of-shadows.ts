import { defineCard } from "../define.js";

// EDHREC rank 26152.

export default defineCard({
  name: "Dance of Shadows",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  subtypes: ["Arcane"],
  text: "Creatures you control get +1/+0 and gain fear until end of turn. (They can't be blocked except by artifact creatures and/or black creatures.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "modify-pt-all", filter: { type: "creature", controlledBy: "you" }, power: 1, toughness: 0, duration: "end-of-turn" },
      { kind: "grant-keyword-all", filter: { type: "creature", controlledBy: "you" }, keyword: "fear", duration: "end-of-turn" },
    ],
  },
});
