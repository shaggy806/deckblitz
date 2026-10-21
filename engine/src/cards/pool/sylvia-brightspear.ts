import { defineCard } from "../define.js";

// Battlebond. EDHREC rank 12134.
//
// Rulings:
//   [2018-06-08] The triggered ability of the "partner with" keyword still triggers in a Commander
//     game. If your other commander has somehow ended up in your library, you can find it. You can
//     also target another player who might have that card in their library.
//
// "Your team" is "you" outside a team game (rule 102.4).

export default defineCard({
  name: "Sylvia Brightspear",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["double-strike"],
  pairing: { kind: "partner-with", name: "Khorvath Brightflame" },
  text: "Partner with Khorvath Brightflame (When this creature enters, target player may put Khorvath into their hand from their library, then shuffle.)\nDouble strike\nDragons your team controls have double strike.",
  static: [
    {
      affects: { scope: "creatures-you-control", subtype: "Dragon" },
      grantKeywords: ["double-strike"],
      text: "Dragons your team controls have double strike.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["player"],
      effect: {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Search your library for a card named Khorvath Brightflame?",
        effect: {
          kind: "search-library",
          filter: { name: "Khorvath Brightflame" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: "When this creature enters, target player may search their library for a card named Khorvath Brightflame, reveal it, put it into their hand, then shuffle.",
    },
  ],
});
