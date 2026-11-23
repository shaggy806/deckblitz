import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

/** The Bringer of the Red Beard's red Equipment artifact named Red Beard (no
 * token printing). "Equipped creature is red": its colour becomes exactly
 * red (layer 5, rule 105.3). */
export default defineCard({
  name: "Red Beard Token",
  tokenName: "Red Beard",
  colors: ["R"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature is red.\nEquip {1}",
  activated: [equip("{1}")],
  static: [{ affects: { scope: "attached" }, setColors: ["R"], text: "Equipped creature is red." }],
});
