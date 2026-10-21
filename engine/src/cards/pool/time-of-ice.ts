import { defineCard } from "../define.js";

// EDHREC rank 11961.

export default defineCard({
  name: "Time of Ice",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Saga"],
  text: "(As this Saga enters and after your draw step, add a lore counter. Sacrifice after III.)\nI, II — Tap target creature an opponent controls. It doesn't untap during its controller's untap step for as long as you control this Saga.\nIII — Return all tapped creatures to their owners' hands.",
  chapters: [
    {
      at: [1, 2],
      targets: ["creature-an-opponent-controls"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "tap", target: 0 },
          { kind: "restrict", target: 0, restrictions: ["doesnt-untap"], duration: "while-you-control-source" },
        ],
      },
      resolve: null,
      text: "I, II — Tap target creature an opponent controls. It doesn't untap during its controller's untap step for as long as you control this Saga.",
    },
    {
      at: [3],
      targets: [],
      effect: { kind: "return-to-hand-all", filter: { type: "creature", tapped: true } },
      resolve: null,
      text: "III — Return all tapped creatures to their owners' hands.",
    },
  ],
});
