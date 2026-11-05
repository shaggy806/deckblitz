import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const TEXT =
  "Equipped creature gets +2/+2, has flying, and is a white Angel in addition to its other colors and types.";

export default defineCard({
  name: "Angelic Armaments",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${TEXT}\nEquip {4}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["flying"],
      addSubtypes: ["Angel"],
      addColors: ["W"],
      text: TEXT,
    },
  ],
  activated: [equip("{4}")],
});
