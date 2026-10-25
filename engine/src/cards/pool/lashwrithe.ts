import { defineCard } from "../define.js";
import { equip, livingWeapon } from "../helpers.js";

// EDHREC rank 8103.
//
// Rulings:
//   [2020-08-07] The Germ token enters the battlefield as a 0/0 creature and the Equipment becomes
//     attached to it before state-based actions would cause the token to die.

const PUMP_TEXT = "Equipped creature gets +1/+1 for each Swamp you control.";

export default defineCard({
  name: "Lashwrithe",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\n${PUMP_TEXT}\nEquip {B/P}{B/P} ({B/P} can be paid with either {B} or 2 life.)`,
  triggered: [livingWeapon()],
  static: [
    {
      affects: { scope: "attached" },
      grantPtPerCount: { filter: { subtype: "Swamp", controlledBy: "you" }, pt: [1, 1] },
      text: PUMP_TEXT,
    },
  ],
  activated: [equip("{B/P}{B/P}")],
});
