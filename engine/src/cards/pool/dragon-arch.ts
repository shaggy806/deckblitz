import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 9703.
//
// Rulings:
//   [2004-10-04] A multicolored card has more than one color in its mana cost.
//   [2007-05-01] Putting the card onto the battlefield is optional. When the ability resolves, you
//     can choose not to.
//
// Elvish Piper's shape, the choice narrowed to multicoloured creature cards; `min: 0` is the
// ruling's "you can choose not to".
const TEXT = "{2}, {T}: You may put a multicolored creature card from your hand onto the battlefield.";

export default defineCard({
  name: "Dragon Arch",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { type: "creature", multicolored: true },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
