import { defineCard } from "../define.js";

// EDHREC rank 30807. Ravnica: City of Guilds.
//
// Rulings:
//   [2005-10-01] The effect has no stated duration, so a land turned into a creature this way
//     continues being a creature as long as the land is on the battlefield.
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn. It doesn’t matter how long the
//     permanent has been a creature.

const TEXT =
  "{1}{B}{G}, {T}: Target Forest becomes a 4/4 black and green Elemental Horror creature. It's still a land.";

export default defineCard({
  name: "Woodwraith Corrupter",
  manaCost: "{3}{B}{B}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Elemental", "Horror"],
  power: 3,
  toughness: 6,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}{G}", tap: true },
      targets: [{ kind: "permanent", filter: { subtype: "Forest" } }],
      effect: {
        kind: "animate",
        target: 0,
        power: 4,
        toughness: 4,
        addTypes: ["creature"],
        addSubtypes: ["Elemental", "Horror"],
        setColors: ["B", "G"],
        duration: "permanent",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
