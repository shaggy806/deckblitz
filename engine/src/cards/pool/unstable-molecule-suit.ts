import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 11572.
//
// "Equip commander {2}" is an equip ability that can only target a commander
// you control (rule 702.6a's "Equip [quality]" — Hulkbuster Armor's "Equip
// Hero"), beside the ordinary Equip {4}. Any commander, whoever owns it.

const STATIC_TEXT = "Equipped creature gets +2/+2 and has indestructible.";

export default defineCard({
  name: "Unstable Molecule Suit",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip commander {2}\nEquip {4}`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      grantKeywords: ["indestructible"],
      text: STATIC_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", isCommander: true } }],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip commander {2}",
      sorcerySpeed: true,
    },
    equip("{4}"),
  ],
});
