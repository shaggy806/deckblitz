import { defineCard } from "../define.js";

// "Hexproof from each color" (rule 702.11d): no opponent's spell of any
// color, nor an ability from a colored source they control, can target it —
// colorless ones can. The cast trigger counts as it resolves.

const CAST_TEXT = "When you cast this spell, you gain 1 life for each colorless permanent you control.";

export default defineCard({
  name: "Breaker of Creation",
  manaCost: "{6}{C}{C}",
  colors: [],
  types: ["creature"],
  subtypes: ["Eldrazi"],
  power: 8,
  toughness: 4,
  text: `${CAST_TEXT}\nHexproof from each color\nAnnihilator 2 (Whenever this creature attacks, defending player sacrifices two permanents of their choice.)`,
  static: [
    {
      affects: { scope: "self" },
      hexproofFrom: { colors: ["W", "U", "B", "R", "G"] },
      text: "Hexproof from each color",
    },
  ],
  triggered: [
    {
      trigger: { on: "this-cast" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { colorless: true, controlledBy: "you" } } },
      resolve: null,
      text: CAST_TEXT,
    },
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "sacrifice", who: "trigger-player", filter: {}, count: 2 },
      resolve: null,
      text: "Annihilator 2",
    },
  ],
});
