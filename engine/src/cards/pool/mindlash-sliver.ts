import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 18923. Mnemonic Sliver's grant to every
// player's Slivers.
//
// Rulings:
//   [2013-07-01] If the creature type of a Sliver changes so it’s no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.

const TEXT = "All Slivers have \"{1}, Sacrifice this permanent: Each player discards a card.\"";

export default defineCard({
  name: "Mindlash Sliver",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "discard", target: "each-player", amount: 1 },
          resolve: null,
          text: "{1}, Sacrifice this permanent: Each player discards a card.",
        },
      ],
      text: TEXT,
    },
  ],
});
