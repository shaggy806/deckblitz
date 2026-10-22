import { defineCard } from "../define.js";

// EDHREC rank 22817. Amonkhet. The target is chosen as the trigger goes on the
// stack and the "you may" asked as it resolves (Anointed Deacon); the
// sacrifice is Krovikan Elementalist's delayed trigger on the same target.

const TEXT =
  "At the beginning of combat on your turn, you may have target creature you control get +2/+0 and gain haste until end of turn. If you do, sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Hazoret's Favor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get +2/+0 and gain haste until end of turn, and sacrifice it at the beginning of the next end step?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: 2, toughness: 0, duration: "end-of-turn" },
            { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice that creature.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
