import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 9384.
// Toxic granted is one more instance, cumulative with the creature's own
// (702.164b, the ruling) — `grantToxic`.

const STATIC_TEXT = "Equipped creature gets +0/+2 and has toxic 1.";

export default defineCard({
  name: "Prosthetic Injector",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +0/+2 and has toxic 1. (Players dealt combat damage by equipped creature also get a poison counter.)\nEquip {1}",
  static: [{ affects: { scope: "attached" }, grantPt: [0, 2], grantToxic: 1, text: STATIC_TEXT }],
  activated: [equip("{1}")],
});
