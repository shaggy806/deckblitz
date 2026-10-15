import { defineCard } from "../define.js";

// EDHREC rank 16727.
//
// Iron Man, Futurist Paragon's animation, until end of turn: artifact and
// creature added in layer 4, flying in 6, base 4/4 in 7b. Its other types
// and abilities stay.

export default defineCard({
  name: "I Am Iron Man",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Until end of turn, target artifact or creature becomes an artifact creature with base power and toughness 4/4 and gains flying.\nDraw a card.",
  targets: [{ kind: "permanent", filter: { typesAnyOf: ["artifact", "creature"] } }],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["artifact", "creature"],
        addSubtypes: [],
        keywords: ["flying"],
        duration: "end-of-turn",
      },
      { kind: "draw", amount: 1 },
    ],
  },
});
