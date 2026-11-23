import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

/** The Crafter's colorless Equipment artifact named Bling (no token
 * printing). */
export default defineCard({
  name: "Bling Token",
  tokenName: "Bling",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "Equipped creature gets +1/+0.\nEquip {1}",
  activated: [equip("{1}")],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
});
