import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 14707. Gemhide Sliver's grant to every
// player's Slivers.
//
// Rulings:
//   [2013-07-01] If the creature type of a Sliver changes so it’s no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.

const TEXT = "All Slivers have \"{T}: Tap target permanent.\"";

export default defineCard({
  name: "Telekinetic Sliver",
  manaCost: "{2}{U}{U}",
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
          cost: { mana: null, tap: true },
          targets: ["permanent"],
          effect: { kind: "tap", target: 0 },
          resolve: null,
          text: "{T}: Tap target permanent.",
        },
      ],
      text: TEXT,
    },
  ],
});
