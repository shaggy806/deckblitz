import { defineCard } from "../define.js";

// EDHREC rank 23422.

const TEXT = "Enchanted creature gets +3/+3, has reach, and is a Giant in addition to its other types.";

export default defineCard({
  name: "Tall as a Beanstalk",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], grantKeywords: ["reach"], addSubtypes: ["Giant"], text: TEXT }],
});
