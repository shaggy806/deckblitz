import { defineCard } from "../define.js";

// Avacyn Restored (AVR). EDHREC rank 29588.
//
// Rulings:
//   [2012-05-01] If you don't control any other creatures, the ability won't do anything.
//
// Ambush Krotiq's untargeted "return another creature you control" on an
// attack trigger.

const TEXT = "Whenever this creature attacks, return another creature you control to its owner's hand.";

export default defineCard({
  name: "Havengul Skaab",
  manaCost: "{5}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 4,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "creature", controlledBy: "you" },
        min: 1,
        upTo: 1,
        exceptSource: true,
        then: { kind: "return-to-hand", target: 0 },
        prompt: "Return another creature you control to its owner's hand",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
