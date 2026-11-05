import { defineCard } from "../define.js";

// "Another" is the commander the ability is on (its source): a sacrifice cost's
// filter is read with the ability's source, so `isSource: false` keeps that
// commander out of the creature half only — an artifact commander may still be
// sacrificed as the artifact (the ruling).
export default defineCard({
  name: "Street Urchin",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["enchantment"],
  subtypes: ["Background"],
  text: 'Commander creatures you own have "{1}, Sacrifice another creature or an artifact: This creature deals 1 damage to any target."',
  static: [
    {
      affects: { scope: "filter", filter: { type: "creature", isCommander: true, ownedBy: "you" } },
      grantsActivated: [
        {
          cost: {
            mana: "{1}",
            tap: false,
            sacrifice: { filter: { anyOf: [{ type: "creature", isSource: false }, { type: "artifact" }] } },
          },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 1, target: 0 },
          resolve: null,
          text: "{1}, Sacrifice another creature or an artifact: This creature deals 1 damage to any target.",
        },
      ],
      text: 'Commander creatures you own have "{1}, Sacrifice another creature or an artifact: This creature deals 1 damage to any target."',
    },
  ],
});
