import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// The Torch deals the damage and the creature's ability targets (the ruling), and
// only a player who controls both can pay (the ruling): Ninja's Kunai's shape.
const BLOCK_TEXT = "Equipped creature can't be blocked by Vampires or Zombies.";
const GRANTED = "{T}, Sacrifice Blazing Torch: Blazing Torch deals 2 damage to any target.";
const GRANT_TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Blazing Torch",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${BLOCK_TEXT}\n${GRANT_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      cantBeBlockedBy: { subtypes: ["Vampire", "Zombie"] },
      text: BLOCK_TEXT,
    },
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, sacrifice: "granter" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0, from: "granter" },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [equip("{1}")],
});
