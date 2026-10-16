import { defineCard } from "../define.js";
import { equip, livingWeapon } from "../helpers.js";

// EDHREC rank 7416. Modern Horizons 3.
//
// "+X/+1, where X is the number of artifacts you control": a live count from
// the Equipment's controller's side (`grantPtPerCount`, +1/+0 per artifact —
// the Ram itself among them) plus a flat +0/+1, in one static. Living weapon
// is the helper.

const PUMP_TEXT = "Equipped creature gets +X/+1, where X is the number of artifacts you control.";

export default defineCard({
  name: "Cranial Ram",
  manaCost: "{B}{R}",
  colors: ["B", "R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text:
    "Living weapon (When this Equipment enters, create a 0/0 black Phyrexian Germ creature token, then attach this to it.)\n" +
    `${PUMP_TEXT}\nEquip {2}`,
  triggered: [livingWeapon()],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 1],
      grantPtPerCount: { filter: { type: "artifact", controlledBy: "you" }, pt: [1, 0] },
      text: PUMP_TEXT,
    },
  ],
  activated: [equip("{2}")],
});
