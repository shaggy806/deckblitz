import { defineCard } from "../define.js";

const MILL_TEXT = "{2}, {T}: Target player mills three cards.";
const STATIC_TEXT = `Equipped creature gets +0/+3 and has "${MILL_TEXT}"`;

export default defineCard({
  name: "Screaming Shield",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${STATIC_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
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
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [0, 3],
      grantsActivated: [
        {
          cost: { mana: "{2}", tap: true },
          targets: ["player"],
          effect: { kind: "mill", target: 0, amount: 3 },
          resolve: null,
          text: MILL_TEXT,
        },
      ],
      text: STATIC_TEXT,
    },
  ],
});
