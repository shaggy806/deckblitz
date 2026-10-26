import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 11263.
//
// "All Sliver creatures" — every player's (Heart Sliver's shape).
//
// Rulings:
//   [2013-07-01] If the creature type of a Sliver changes so it's no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//     However, for some abilities, like flying, having more than one instance of the ability
//     doesn't provide any additional benefit.

export default defineCard({
  name: "Spinneret Sliver",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: "All Sliver creatures have reach.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["reach"],
      text: "All Sliver creatures have reach.",
    },
  ],
});
