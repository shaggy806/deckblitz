import { defineCard } from "../define.js";

// Magic 2015 (M15). EDHREC rank 12608.
//
// Viridian Longbow's granted-ability shape: the ability belongs to the enchanted creature, so
// the creature is the damage source and taps for it, and `powerOf: "source"` is its power as
// the ability resolves (as it last existed, if it has left — the first ruling).
//
// Rulings:
//   [2020-11-10] Use the power of the enchanted creature as the activated ability resolves to
//     determine how much damage is dealt. If the creature isn't on the battlefield at that time,
//     use its power as it last existed on the battlefield.
//   [2020-11-10] The enchanted creature is the source of the activated ability, not Burning Anger.
//     For example, if the enchanted creature is green, you could activate the ability choosing a
//     creature with protection from red as the target.

const GRANTED = "{T}: This creature deals damage equal to its power to any target.";
const TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Burning Anger",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["any-target"],
          effect: { kind: "damage", amount: { powerOf: "source" }, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
