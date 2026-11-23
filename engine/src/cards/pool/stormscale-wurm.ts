import { defineCard } from "../define.js";

// Playtest card (Mystery Booster 2). Storm on a permanent spell: each copy
// resolves into a token (rule 608.3f).

export default defineCard({
  name: "Stormscale Wurm",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: "Trample\nOther Wurms you control get +1/+1.\nStorm (When you cast this spell, copy it for each spell cast before it this turn. The copies become tokens.)",
  static: [
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", subtype: "Wurm", controlledBy: "you" },
        excludeSelf: true,
      },
      grantPt: [1, 1],
      text: "Other Wurms you control get +1/+1.",
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "storm" },
      resolve: null,
      text: "Storm (When you cast this spell, copy it for each spell cast before it this turn. The copies become tokens.)",
    },
  ],
});
