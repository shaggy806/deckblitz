import { defineCard } from "../define.js";

// Odyssey (ODY). EDHREC rank 32110. Ride the Shoopuf's animation, until end
// of turn.
//
// Rulings:
//   [2008-08-01] A noncreature permanent that turns into a creature can attack, and its {T}
//     abilities can be activated, only if its controller has continuously controlled that
//     permanent since the beginning of their most recent turn.

const TEXT =
  "{G}{G}: This enchantment becomes a 4/3 Centaur creature in addition to its other types until end of turn.";

export default defineCard({
  name: "Still Life",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}{G}", tap: false },
      targets: [],
      effect: {
        kind: "animate",
        target: "source",
        power: 4,
        toughness: 3,
        addTypes: ["creature"],
        addSubtypes: ["Centaur"],
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
