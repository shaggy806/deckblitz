import { defineCard } from "../define.js";

// EDHREC rank 22066. Dominaria.

const PT_TEXT = "Equipped creature gets +2/+0.";
const STRIKE_TEXT = "During your turn, equipped creature has first strike.";

export default defineCard({
  name: "Jousting Lance",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `${PT_TEXT}\n${STRIKE_TEXT}\nEquip {3} ({3}: Attach to target creature you control. Equip only as a sorcery.)`,
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
    { affects: { scope: "attached" }, grantPt: [2, 0], text: PT_TEXT },
    {
      affects: { scope: "attached" },
      condition: { kind: "your-turn" },
      grantKeywords: ["first-strike"],
      text: STRIKE_TEXT,
    },
  ],
});
