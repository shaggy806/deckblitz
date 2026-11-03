import { defineCard } from "../define.js";

const STATIC_TEXT = "Equipped creature gets +3/+1 and must be blocked by an Eldrazi if able.";

export default defineCard({
  name: "Slayer's Cleaver",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {4}`,
  activated: [
    {
      cost: { mana: "{4}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {4}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [3, 1],
      mustBeBlockedBy: { by: { type: "creature", subtype: "Eldrazi" } },
      text: STATIC_TEXT,
    },
  ],
});
