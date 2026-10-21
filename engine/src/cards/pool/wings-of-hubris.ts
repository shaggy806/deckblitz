import { defineCard } from "../define.js";

// Sacrificed as the cost, the Equipment reads the creature it last equipped
// (`"attached"`), and the delayed trigger is set up about that creature
// (`about: "attached"`). You sacrifice it only if you control it then (its rulings;
// rule 701.21a).
const SAC =
  "Sacrifice this Equipment: Equipped creature can't be blocked this turn. Sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Wings of Hubris",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: `Equipped creature has flying.\n${SAC}\nEquip {1} ({1}: Attach to target creature you control. Equip only as a sorcery.)`,
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: "attached", keyword: "unblockable", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            about: "attached",
            effect: { kind: "sacrifice-target", target: 0 },
            text: "Sacrifice it at the beginning of the next end step.",
          },
        ],
      },
      resolve: null,
      text: SAC,
    },
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {1}",
      sorcerySpeed: true,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantKeywords: ["flying"],
      text: "Equipped creature has flying.",
    },
  ],
});
