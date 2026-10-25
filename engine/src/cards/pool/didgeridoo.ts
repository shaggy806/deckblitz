import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 18311.
//
// Rulings:
//   [2007-05-01] Putting the card onto the battlefield is optional. When the ability resolves, you
//     can choose not to.
//
// Leyline Surge's shape: a choice of up to one card from the hand (`min: 0`),
// a Minotaur permanent card — a Kindred instant or sorcery is a Minotaur card
// but not a permanent card.

const TEXT = "{3}: You may put a Minotaur permanent card from your hand onto the battlefield.";

export default defineCard({
  name: "Didgeridoo",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { subtype: "Minotaur", notTypes: ["instant", "sorcery"] },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
