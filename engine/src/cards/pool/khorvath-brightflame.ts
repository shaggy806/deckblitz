import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 17230.
//
// Rulings:
//   [2018-06-08] The triggered ability of the "partner with" keyword still triggers in a Commander
//     game. If your other commander has somehow ended up in your library, you can find it. You can
//     also target another player who might have that card in their library.
//
// "Your team" is "you" outside a team game (rule 102.4).

export default defineCard({
  name: "Khorvath Brightflame",
  manaCost: "{5}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 3,
  toughness: 4,
  keywords: ["flying", "haste"],
  pairing: { kind: "partner-with", name: "Sylvia Brightspear" },
  text: "Partner with Sylvia Brightspear (When this creature enters, target player may put Sylvia into their hand from their library, then shuffle.)\nFlying, haste\nKnights your team controls have flying and haste.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Knight" },
      grantKeywords: ["flying", "haste"],
      text: "Knights your team controls have flying and haste.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Sylvia Brightspear?",
        effect: {
          kind: "search-library",
          filter: { name: "Sylvia Brightspear" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Sylvia Brightspear, reveal it, put it into their hand, then shuffle.",
    },
  ],
});
