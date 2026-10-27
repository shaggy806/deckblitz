import { defineCard } from "../define.js";
import { equip } from "../helpers.js";

// EDHREC rank 25449.
//
// The {R}{R} ability is equip's shape without `sorcerySpeed` (Cranial
// Plating's): instant speed, and not an equip ability.
const ATTACH_TEXT = "{R}{R}: Attach this Equipment to target creature you control.";

export default defineCard({
  name: "Sparring Collar",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has first strike.\n${ATTACH_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{R}{R}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: ATTACH_TEXT,
    },
    equip("{1}"),
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["first-strike"],
      text: "Equipped creature has first strike.",
    },
  ],
});
