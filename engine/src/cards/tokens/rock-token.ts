import { defineCard } from "../define.js";

const GRANTED = "{1}, {T}, Sacrifice Rock: This creature deals 2 damage to any target.";
const TEXT = `Equipped creature has "${GRANTED}"`;

/** The colorless Equipment named Rock (Toggo, Goblin Weaponsmith). "Rock" in
 * the granted ability is the Equipment that grants it (rule 201.5a); "this
 * creature" is the one equipped, dealing the damage. Keyed " Token", named by
 * `tokenName`. */
export default defineCard({
  name: "Rock Token",
  tokenName: "Rock",
  art: "661cbde4-9444-4259-b2cf-7c8f9814a071",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1}`,
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: "{1}", tap: true, sacrifice: "granter" },
          targets: ["any-target"],
          effect: { kind: "damage", amount: 2, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
