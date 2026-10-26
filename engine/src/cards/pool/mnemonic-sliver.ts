import { defineCard } from "../define.js";

// EDHREC rank 19869. "All Slivers" — every Sliver, opponents' too (Necrotic Sliver's shape).

const GRANTED_TEXT = "{2}, Sacrifice this permanent: Draw a card.";
const TEXT = `All Slivers have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Mnemonic Sliver",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "draw", amount: 1 },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
