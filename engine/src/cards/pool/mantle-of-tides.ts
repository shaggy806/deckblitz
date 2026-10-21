import { defineCard } from "../define.js";

// EDHREC rank 22672. Once a turn, on the second card drawn (Tiger-Seal's
// trigger); it may target the creature it's already attached to, and an
// illegal target leaves it where it was (the rulings).

const DRAW_TEXT = "Whenever you draw your second card each turn, attach this Equipment to target creature you control.";

export default defineCard({
  name: "Mantle of Tides",
  manaCost: "{U}",
  colors: ["U"],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+2.\n${DRAW_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: "{3}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {3}",
      sorcerySpeed: true,
    },
  ],
  triggered: [
    {
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0, attachment: "source" },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
  static: [{ affects: { scope: "attached" }, grantPt: [1, 2], text: "Equipped creature gets +1/+2." }],
});
