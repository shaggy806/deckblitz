import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

const STATIC_TEXT = "Equipped creature gets +2/+2 and is a Spider Hero in addition to its other types.";

export default defineCard({
  name: "Spider-Suit",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [2, 2],
      addSubtypes: ["Spider", "Hero"],
      text: STATIC_TEXT,
    },
  ],
  activated: [equip("{3}")],
});
