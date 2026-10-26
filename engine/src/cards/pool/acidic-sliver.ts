import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 19134. Mnemonic Sliver's shape: the granted
// ability reaches every Sliver on the battlefield, whoever controls it, and
// the damage is dealt by the sacrificed Sliver (Inferno Fist's last known
// information).
//
// Rulings:
//   [2013-07-01] If the creature type of a Sliver changes so it's no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//     However, for some abilities, like flying, having more than one instance of the ability
//     doesn't provide any additional benefit.

export default defineCard({
  name: "Acidic Sliver",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Slivers have \"{2}, Sacrifice this permanent: This permanent deals 2 damage to any target.\"",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: "self" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0 },
          resolve: null,
          text: "{2}, Sacrifice this permanent: This permanent deals 2 damage to any target.",
        },
      ],
      text: "All Slivers have \"{2}, Sacrifice this permanent: This permanent deals 2 damage to any target.\"",
    },
  ],
});
