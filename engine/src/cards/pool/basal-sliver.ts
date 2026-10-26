import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 8990. Darkheart Sliver's shape: every
// player's Slivers, the sacrificed Sliver's controller gets the mana.
//
// Rulings:
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//     However, for some abilities, like flying, having more than one instance of the ability
//     doesn’t provide any additional benefit.
//   [2013-07-01] If the creature type of a Sliver changes so it’s no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.

const TEXT = "All Slivers have \"Sacrifice this permanent: Add {B}{B}.\"";

export default defineCard({
  name: "Basal Sliver",
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
          cost: { mana: null, tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "add-mana", mana: "B", amount: 2 },
          resolve: null,
          text: "Sacrifice this permanent: Add {B}{B}.",
        },
      ],
      text: TEXT,
    },
  ],
});
