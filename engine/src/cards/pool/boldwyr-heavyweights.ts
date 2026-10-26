import { defineCard } from "../define.js";

// EDHREC rank 12473. Morningtide.
//
// Rulings:
//   [2008-04-01] A player who doesn’t want to shuffle their library may choose not to search for a
//     creature card.
//
// Noble Benefactor's shape for opponents only: each opponent chooses whether to
// search, so one who declines doesn't shuffle (the ruling); the creature enters
// under the searching player's control.
const ENTER_TEXT =
  "When this creature enters, each opponent may search their library for a creature card and put it onto the battlefield. Then each player who searched their library this way shuffles.";

export default defineCard({
  name: "Boldwyr Heavyweights",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 8,
  toughness: 8,
  keywords: ["trample"],
  text: `Trample\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-opponent",
        prompt: "Search your library for a creature card and put it onto the battlefield?",
        effect: {
          kind: "search-library",
          filter: { type: "creature" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
