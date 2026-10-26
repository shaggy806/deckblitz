import { defineCard } from "../define.js";

// Rulings:
//   [2012-05-01] The ability granted by Dual Casting can target (and copy) any instant or sorcery
//     spell you control, not just one with targets.
//   [2012-05-01] If the spell being copied is modal, the copy will have the same mode(s).
//   [2012-05-01] The copy is created on the stack, so it's not "cast."

export default defineCard({
  name: "Dual Casting",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nEnchanted creature has \"{R}, {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy.\"",
  targets: ["creature"],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: true },
          targets: [{ kind: "spell", whose: "you", filter: { typesAnyOf: ["instant", "sorcery"] } }],
          effect: { kind: "copy-spell", target: 0, newTargets: true },
          resolve: null,
          text: "{R}, {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy.",
        },
      ],
      text: "Enchanted creature has \"{R}, {T}: Copy target instant or sorcery spell you control. You may choose new targets for the copy.\"",
    },
  ],
});
