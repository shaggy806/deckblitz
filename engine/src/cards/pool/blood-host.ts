import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 25543.
//
// Rulings:
//   [2014-07-18] If Blood Host isn’t on the battlefield when its ability resolves, you won’t put a
//     +1/+1 counter on it but you’ll still gain 2 life.

const TEXT = "{1}{B}, Sacrifice another creature: Put a +1/+1 counter on this creature and you gain 2 life.";

export default defineCard({
  name: "Blood Host",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
          { kind: "gain-life", amount: 2 },
        ],
      },
      resolve: null,
      text: TEXT,
      otherOnly: true,
    },
  ],
});
