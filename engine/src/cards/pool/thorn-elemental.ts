import { defineCard } from "../define.js";

const STATIC_TEXT = "You may have this creature assign its combat damage as though it weren't blocked.";

// Chosen as combat damage is assigned, all of it or none: its damage can't
// be split between the blockers and the player or planeswalker it's
// attacking — and it can still be chosen once every blocker has left combat.
export default defineCard({
  name: "Thorn Elemental",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 7,
  toughness: 7,
  text: STATIC_TEXT,
  static: [{ affects: { scope: "self" }, assignAsThoughUnblocked: true, text: STATIC_TEXT }],
});
