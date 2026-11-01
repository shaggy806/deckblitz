import { defineCard } from "../define.js";

const TEXT =
  "Domain — Creatures can't attack you unless their controller pays {X} for each creature they control that's attacking you, where X is the number of basic land types among lands you control.";

// Only the player: "attacking you" leaves their planeswalkers free.
export default defineCard({
  name: "Collective Restraint",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  static: [{ affects: { scope: "self" }, attackTax: { generic: { basicLandTypes: "you" } }, text: TEXT }],
});
