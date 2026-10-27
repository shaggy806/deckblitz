import { defineCard } from "../define.js";

// Invasion (INV). EDHREC rank 29797.
//
// Rulings:
//   [2004-10-04] This does not count as your one land you can normally play each turn.
//   [2007-05-01] Putting the card onto the battlefield is optional. When the ability resolves, you
//     can choose not to.

const TEXT = "{G}, {T}: You may put a basic land card from your hand onto the battlefield.";

export default defineCard({
  name: "Firebrand Ranger",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ranger"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{G}", tap: true },
      targets: [],
      effect: {
        kind: "look-and-choose",
        zone: "hand",
        min: 0,
        max: 1,
        destination: "battlefield",
        leftover: "stay",
        filter: { supertype: "basic", type: "land" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
