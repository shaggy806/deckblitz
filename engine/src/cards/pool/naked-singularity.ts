import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// Ice Age.
//
// Reality Twist's `manaProduction` with Islands too, whoever taps the land (rules 106.12,
// 614.1a). A land of two basic types matches two entries, and its tapper picks which type it
// makes (the ruling; rule 616.1d — `Game.landManaInsteadFor` merges them).

const upkeep = cumulativeUpkeep("{3}");
const TEXT =
  "If tapped for mana, Plains produce {R}, Islands produce {G}, Swamps produce {W}, Mountains produce {U}, and Forests produce {B} instead of any other type.";

export default defineCard({
  name: "Naked Singularity",
  manaCost: "{5}",
  colors: [],
  types: ["artifact"],
  text: `${upkeep.text}\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      manaProduction: [
        { filter: { type: "land", subtype: "Plains" }, produces: "R", tapper: "any" },
        { filter: { type: "land", subtype: "Island" }, produces: "G", tapper: "any" },
        { filter: { type: "land", subtype: "Swamp" }, produces: "W", tapper: "any" },
        { filter: { type: "land", subtype: "Mountain" }, produces: "U", tapper: "any" },
        { filter: { type: "land", subtype: "Forest" }, produces: "B", tapper: "any" },
      ],
      text: TEXT,
    },
  ],
  triggered: [upkeep],
});
