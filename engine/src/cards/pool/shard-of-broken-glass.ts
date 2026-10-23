import { defineCard } from "../define.js";

// EDHREC rank 21434.

const MILL_TEXT = "Whenever equipped creature attacks, you may mill two cards.";

export default defineCard({
  name: "Shard of Broken Glass",
  manaCost: "{1}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature gets +1/+0.\n${MILL_TEXT}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  static: [{ affects: { scope: "attached" }, grantPt: [1, 0], text: "Equipped creature gets +1/+0." }],
  triggered: [
    {
      trigger: { on: "attacks", who: "attached" },
      targets: [],
      effect: { kind: "may", prompt: "Mill two cards?", effect: { kind: "mill", target: "you", amount: 2 } },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
});
