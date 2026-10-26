import { defineCard } from "../define.js";

// Stronghold (STH). EDHREC rank 21384. Mnemonic Sliver's shape.
//
// Rulings:
//   [2013-07-01] If the creature type of a Sliver changes so it's no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//     However, for some abilities, like flying, having more than one instance of the ability
//     doesn't provide any additional benefit.

export default defineCard({
  name: "Victual Sliver",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Slivers have \"{2}, Sacrifice this permanent: You gain 4 life.\"",
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: false, sacrifice: "self" },
          targets: [],
          effect: { kind: "gain-life", amount: 4 },
          resolve: null,
          text: "{2}, Sacrifice this permanent: You gain 4 life.",
        },
      ],
      text: "All Slivers have \"{2}, Sacrifice this permanent: You gain 4 life.\"",
    },
  ],
});
