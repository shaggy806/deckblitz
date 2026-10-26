import { defineCard } from "../define.js";

// EDHREC rank 17287.
//
// Rulings:
//   [2013-07-01] If you change the creature type of a Sliver you control so it’s no longer a
//     Sliver, it will no longer be affected by its own ability. Its ability will continue to
//     affect other Sliver creatures you control.
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//     However, for some abilities, like flying, having more than one instance of the ability
//     doesn’t provide any additional benefit.

const TEXT = "Sliver creatures you control get +2/+0.";

export default defineCard({
  name: "Battle Sliver",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 3,
  toughness: 3,
  text: TEXT,
  static: [{ affects: { scope: "creatures-you-control", subtype: "Sliver" }, grantPt: [2, 0], text: TEXT }],
});
