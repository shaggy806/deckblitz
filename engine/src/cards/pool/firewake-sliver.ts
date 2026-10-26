import { defineCard } from "../define.js";

// Time Spiral (TSP). EDHREC rank 10590.
//
// "All Sliver creatures" and "All Slivers" — every player's, not only yours
// (Heart Sliver's and Mnemonic Sliver's shapes).
//
// Rulings:
//   [2013-07-01] Abilities that Slivers grant, as well as power/toughness boosts, are cumulative.
//     However, for some abilities, like flying, having more than one instance of the ability
//     doesn't provide any additional benefit.
//   [2013-07-01] If the creature type of a Sliver changes so it's no longer a Sliver, it will no
//     longer be affected by its own ability. Its ability will continue to affect other Sliver
//     creatures.

const GRANTED_TEXT = "{1}, Sacrifice this permanent: Target Sliver creature gets +2/+2 until end of turn.";
const GRANT_TEXT = `All Slivers have "${GRANTED_TEXT}"`;

export default defineCard({
  name: "Firewake Sliver",
  manaCost: "{1}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 1,
  toughness: 1,
  text: `All Sliver creatures have haste.\n${GRANT_TEXT}`,
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", subtype: "Sliver" } },
      grantKeywords: ["haste"],
      text: "All Sliver creatures have haste.",
    },
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, sacrifice: "self" },
          targets: [{ kind: "permanent", filter: { type: "creature", subtype: "Sliver" } }],
          effect: { kind: "modify-pt", target: 0, power: 2, toughness: 2, duration: "end-of-turn" },
          resolve: null,
          text: GRANTED_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
});
