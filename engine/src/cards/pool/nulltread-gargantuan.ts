import { defineCard } from "../define.js";

// EDHREC rank 29819.
//
// Rulings:
//   [2009-05-01] Nulltread Gargantuan's ability doesn't target the creature you put on top of its
//     owner's library. You don't choose one until the ability resolves.
//   [2009-05-01] If you control no other creatures, you'll have to put Nulltread Gargantuan on top
//     of its owner's library.
const ENTER_TEXT = "When this creature enters, put a creature you control on top of its owner's library.";

export default defineCard({
  name: "Nulltread Gargantuan",
  manaCost: "{1}{G}{U}",
  colors: ["U", "G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 6,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        then: { kind: "put-on-library", target: 0, position: "top" },
        prompt: "Put a creature you control on top of its owner's library",
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
