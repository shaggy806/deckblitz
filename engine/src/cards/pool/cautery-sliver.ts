import { defineCard } from "../define.js";

// Acidic Sliver's shape, twice. Its ruling: the first ability can affect any kind
// of creature, the second only Slivers, and both can affect players.

const DAMAGE = "{1}, Sacrifice this permanent: This permanent deals 1 damage to any target.";
const PREVENT =
  "{1}, Sacrifice this permanent: Prevent the next 1 damage that would be dealt to target player, planeswalker, or Sliver creature this turn.";
const TEXT_DAMAGE = `All Slivers have "${DAMAGE}"`;
const TEXT_PREVENT = `All Slivers have "${PREVENT}"`;

export default defineCard({
  name: "Cautery Sliver",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 2,
  toughness: 2,
  text: `${TEXT_DAMAGE}\n${TEXT_PREVENT}`,
  static: [
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, sacrifice: "self" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: DAMAGE,
        },
      ],
      text: TEXT_DAMAGE,
    },
    {
      affects: { scope: "filter", filter: { subtype: "Sliver" } },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: false, sacrifice: "self" },
          targets: [
            {
              kind: "permanent",
              filter: { anyOf: [{ type: "planeswalker" }, { type: "creature", subtype: "Sliver" }] },
              orPlayer: "any",
            },
          ],
          effect: { kind: "prevent-damage", target: 0, amount: 1 },
          resolve: null,
          text: PREVENT,
        },
      ],
      text: TEXT_PREVENT,
    },
  ],
});
