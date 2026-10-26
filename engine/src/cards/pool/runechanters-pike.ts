import { defineCard } from "../define.js";

// EDHREC rank 9908.
//
// Rulings:
//   [2011-09-22] The value of X is constantly updated as instant cards and sorcery cards are put
//     into or removed from your graveyard.

const STATIC_TEXT =
  "Equipped creature has first strike and gets +X/+0, where X is the number of instant and sorcery cards in your graveyard.";

export default defineCard({
  name: "Runechanter's Pike",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {2}`,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      grantPtPerCount: {
        inGraveyard: { typesAnyOf: ["instant", "sorcery"], ownedBy: "you" },
        pt: [1, 0],
      },
      text: STATIC_TEXT,
    },
  ],
});
