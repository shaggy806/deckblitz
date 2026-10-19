import { defineCard } from "../define.js";

// EDHREC rank 10321.
//
// Rulings:
//   [2022-09-09] If Jhoira, Ageless Innovator isn't on the battlefield as the activated ability
//     resolves, you won't be able to put any ingenuity counters on it. However, you can still put
//     an artifact card from your hand onto the battlefield. Use the number of ingenuity counters
//     that were on Jhoira before it left the battlefield to determine the value of X.
//
// X is read after the two counters go on — or, once Jhoira has left, as she
// last existed (`countersOn: "source"`).
const TEXT =
  "{T}: Put two ingenuity counters on Jhoira, then you may put an artifact card with mana value X or less from your hand onto the battlefield, where X is the number of ingenuity counters on Jhoira.";

export default defineCard({
  name: "Jhoira, Ageless Innovator",
  manaCost: "{U}{R}",
  colors: ["U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Artificer"],
  power: 2,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: "source", counter: "ingenuity", amount: 2 },
          {
            kind: "look-and-choose",
            zone: "hand",
            min: 0,
            max: 1,
            destination: "battlefield",
            leftover: "stay",
            filter: {
              type: "artifact",
              manaValue: { op: "lte", n: { amount: { countersOn: "source", counter: "ingenuity" } } },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
