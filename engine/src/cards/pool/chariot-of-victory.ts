import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 7662.
const TEXT = "Equipped creature has first strike, trample, and haste.";

export default defineCard({
  name: "Chariot of Victory",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {1}`,
  static: [{ affects: { scope: "attached" }, grantKeywords: ["first-strike", "trample", "haste"], text: TEXT }],
  activated: [equip("{1}")],
});
