import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 29392. Chimeric Staff's X/X animation, keeping
// its enchantment type ("in addition to its other types").
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.

const TEXT =
  "{X}: This enchantment becomes an X/X Wall creature with defender in addition to its other types until end of turn.";

export default defineCard({
  name: "Testament of Faith",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{X}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: "x",
        toughness: "x",
        addTypes: ["creature"],
        addSubtypes: ["Wall"],
        keywords: ["defender"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
