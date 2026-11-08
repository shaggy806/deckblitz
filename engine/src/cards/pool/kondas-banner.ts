import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const ONLY = "Konda's Banner can be attached only to a legendary creature.";
const COLOR = "Creatures that share a color with equipped creature get +1/+1.";
const TYPE = "Creatures that share a creature type with equipped creature get +1/+1.";

// Sharing more than one color or type adds nothing, and the equipped creature
// shares with itself as long as it has a color or a creature type (the rulings).
export default defineCard({
  name: "Konda's Banner",
  manaCost: "{2}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${ONLY}\n${COLOR}\n${TYPE}\nEquip {2}`,
  activated: [equip("{2}")],
  static: [
    { affects: { scope: "self" }, attachOnlyTo: { type: "creature", supertype: "legendary" }, text: ONLY },
    { affects: { scope: "filter", filter: { type: "creature", sharesColorWith: "attached" } }, grantPt: [1, 1], text: COLOR },
    {
      affects: { scope: "filter", filter: { type: "creature", sharesCreatureTypeWith: "attached" } },
      grantPt: [1, 1],
      text: TYPE,
    },
  ],
});
