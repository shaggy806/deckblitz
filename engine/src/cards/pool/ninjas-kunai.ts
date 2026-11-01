import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The granted ability is the equipped creature's, but "Ninja's Kunai" in it
// is the Equipment that grants it (rule 201.5a): the cost sacrifices that
// Equipment, and the Equipment deals the damage, as it last existed (608.2h).

const GRANTED = "{1}, {T}, Sacrifice Ninja's Kunai: Ninja's Kunai deals 3 damage to any target.";
const TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Ninja's Kunai",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: true, sacrifice: "granter" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 3, target: 0, from: "granter" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{1}")],
});
