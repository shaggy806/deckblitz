import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// Rulings:
//   Unattaching Razor Boomerang is a cost to activate the equipped creature's ability.
//   If the targeted creature is an illegal target by the time the equipped creature's ability
//     resolves, the entire ability doesn't resolve. Razor Boomerang remains on the battlefield
//     unattached.
//   The source of the damage is Razor Boomerang, not the equipped creature. However, the equipped
//     creature's ability is what targets the permanent or player.
//   If Razor Boomerang is no longer on the battlefield by time the equipped creature's ability
//     resolves, it's not returned to its owner's hand. The rest of the ability resolves as normal, so
//     Razor Boomerang will still deal damage to the targeted creature.

const GRANTED = "{T}, Unattach Razor Boomerang: It deals 1 damage to any target. Return Razor Boomerang to its owner's hand.";
const TEXT = `Equipped creature has "${GRANTED}"`;

export default defineCard({
  name: "Razor Boomerang",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true, unattach: "granter" },
          targets: ["any-target"],
          effect: {
            kind: "sequence",
            effects: [
              { kind: "damage", amount: 1, target: 0, from: "granter" },
              { kind: "return-to-hand", target: "granter" },
            ],
          },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [equip("{2}")],
});
