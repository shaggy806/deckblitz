import { defineCard } from "../define.js";

// EDHREC rank 26654. "All Slivers" — every Sliver, opponents' too (Mnemonic Sliver's shape);
// the granted ability is Urborg Mindsucker's with "target player".

const GRANTED_TEXT = "{2}, Sacrifice this permanent: Target player discards a card at random. Activate only as a sorcery.";
const TEXT = `All Slivers have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Mindwhip Sliver",
  manaCost: "{2}{B}",
  colors: ["B"],
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
          targets: ["player"],
          effect: { kind: "discard", target: 0, amount: 1, random: true },
          resolve: null,
          sorcerySpeed: true,
          text: GRANTED_TEXT,
        },
      ],
      text: TEXT,
    },
  ],
});
