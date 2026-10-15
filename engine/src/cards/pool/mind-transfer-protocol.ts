import { defineCard } from "../define.js";

// EDHREC rank 20541.
//
// Layer 7b: the base 4/5 overwrites earlier P/T-setting effects, and every
// modification and counter still applies on top (the rulings).

export default defineCard({
  name: "Mind Transfer Protocol",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target artifact or creature becomes an artifact creature with base power and toughness 4/5.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 5,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        keywords: [],
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
