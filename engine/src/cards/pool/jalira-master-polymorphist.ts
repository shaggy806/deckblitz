import { defineCard } from "../define.js";

// EDHREC rank 14486.
//
// Rulings:
//   [2018-03-16] If your library has no nonlegendary creature cards in it, you'll reveal all the
//     cards in your library, then put them in a random order.
export default defineCard({
  name: "Jalira, Master Polymorphist",
  manaCost: "{3}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{2}{U}, {T}, Sacrifice another creature: Reveal cards from the top of your library until you reveal a nonlegendary creature card. Put that card onto the battlefield and the rest on the bottom of your library in a random order.",
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true, sacrifice: "creature-you-control" },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { type: "creature", notSupertype: "legendary" },
        put: "battlefield",
        rest: "bottom-random",
      },
      resolve: null,
      text: "{2}{U}, {T}, Sacrifice another creature: Reveal cards from the top of your library until you reveal a nonlegendary creature card. Put that card onto the battlefield and the rest on the bottom of your library in a random order.",
      otherOnly: true,
    },
  ],
});
