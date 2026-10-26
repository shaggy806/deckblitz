import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const TEXT = "Equipped creature gets +1/+1 and is an artifact in addition to its other types.";

// Becoming an artifact doesn't change its colours (the ruling).
export default defineCard({
  name: "Silverskin Armor",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {2}`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 1], addTypes: ["artifact"], text: TEXT }],
  activated: [equip("{2}")],
});
