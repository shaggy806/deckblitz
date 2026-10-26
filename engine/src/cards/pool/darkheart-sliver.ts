import { defineCard } from "../define.js";

// Planar Chaos (PLC). EDHREC rank 14030. Victual Sliver's shape.
//
// Rulings:
//   [2007-02-01] The player who controlled the Sliver that's sacrificed gains the life, not the
//     controller of Darkheart Sliver.
//   [2013-07-01] If the creature type of a Sliver changes so it's no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.

const TEXT = "All Slivers have \"Sacrifice this permanent: You gain 3 life.\"";

export default defineCard({
  name: "Darkheart Sliver",
  manaCost: "{B}{G}",
  colors: ["B", "G"],
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
          cost: { mana: null, tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 3 },
          resolve: null,
          text: "Sacrifice this permanent: You gain 3 life.",
        },
      ],
      text: TEXT,
    },
  ],
});
