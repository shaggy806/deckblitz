import { defineCard } from "../define.js";
import { equip, livingWeapon } from "../helpers.js";

// EDHREC rank 13930.
// Makes Phyrexian Germ → use "Phyrexian Germ Token" (living weapon).
//
// Rulings:
//   [2024-06-07] If the Phyrexian Germ token is destroyed, the Equipment remains on the
//     battlefield as with any other Equipment.
//   [2024-06-07] The Phyrexian Germ token enters the battlefield as a 0/0 creature and the
//     Equipment becomes attached to it before state-based actions would cause the token to die.
//     Abilities that trigger as the token enters the battlefield see that a 0/0 creature entered
//     the battlefield.
const ATTACK_TEXT = "Whenever equipped creature attacks, each opponent loses 1 life.";

export default defineCard({
  name: "Drossclaw",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\n" +
    `Equipped creature gets +1/+1.\n${ATTACK_TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], text: "Equipped creature gets +1/+1." }],
  triggered: [
    livingWeapon(),
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-opponent" },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
