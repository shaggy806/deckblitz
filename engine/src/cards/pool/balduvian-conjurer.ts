import { defineCard } from "../define.js";

// Ice Age. EDHREC rank 29446.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn't matter how long the
//     permanent has been a creature.
//   [2008-10-01] If an affected land later loses the supertype snow, Balduvian Conjurer's effect
//     doesn't end. The land will remain a creature until end of turn.

const TEXT = "{T}: Target snow land becomes a 2/2 creature until end of turn. It's still a land.";

export default defineCard({
  name: "Balduvian Conjurer",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 0,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "land", supertype: "snow" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 2,
        toughness: 2,
        addTypes: ["creature"],
        addSubtypes: [],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
