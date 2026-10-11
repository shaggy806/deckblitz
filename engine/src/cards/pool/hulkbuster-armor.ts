import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 8833.
//
// "Equip Hero {3}" is an equip ability that can only target a Hero you
// control (rule 702.6a's "Equip [quality]"), beside the ordinary Equip {6}.
const STATIC_TEXT = "Equipped creature has base power and toughness 9/9 and has flying.";

export default defineCard({
  name: "Hulkbuster Armor",
  manaCost: "{4}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip Hero {3}\nEquip {6}`,
  static: [
    {
      affects: { scope: "attached" },
      setBasePt: { power: 9, toughness: 9 },
      grantKeywords: ["flying"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", subtype: "Hero" } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip Hero {3}",
      sorcerySpeed: true,
    },
    equip("{6}"),
  ],
});
