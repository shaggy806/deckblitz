import { defineCard } from "../define.js";

// EDHREC rank 23886.
//
// Rulings:
//   [2019-06-14] At the beginning of the next end step, you'll sacrifice the planeswalker if it's
//     still on the battlefield, even if Planebound Accomplice has left the battlefield.
// Purphoros, Bronze-Blooded's shape, for a planeswalker card.

const TEXT =
  "{R}: You may put a planeswalker card from your hand onto the battlefield. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Planebound Accomplice",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "planeswalker" },
        then: {
          kind: "delayed-trigger",
          at: "next-end-step",
          effect: { kind: "sacrifice-target", target: 0 },
          text: "Sacrifice the planeswalker Planebound Accomplice put onto the battlefield.",
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
