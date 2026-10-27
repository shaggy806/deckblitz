import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 19680. Telekinetic Sliver's grant to every
// player's Slivers, with Crossbow Infantry's ability.
//
// Rulings:
//   [2013-07-01] If the creature type of a Sliver changes so it’s no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.

const TEXT = 'All Slivers have "{T}: This permanent deals 1 damage to target attacking or blocking creature."';

export default defineCard({
  name: "Quilled Sliver",
  manaCost: "{1}{W}",
  colors: ["W"],
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
          cost: { mana: null, tap: true },
          targets: ["attacking-or-blocking-creature"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: "{T}: This permanent deals 1 damage to target attacking or blocking creature.",
        },
      ],
      text: TEXT,
    },
  ],
});
