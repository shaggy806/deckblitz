import { defineCard } from "../define.js";

// Fallen Empires. EDHREC rank 27610.
//
// The flip is a delayed trigger about the ability's own target (rule 603.7c): you flip as it
// resolves, and on a loss you sacrifice that creature — only while you still control it (rule
// 701.21a), and not once it has changed zones (rule 400.7).
const TEXT =
  "{R}: Target creature you control with toughness 2 or less gains flying until end of turn. Flip a coin at the beginning of the next end step. If you lose the flip, sacrifice that creature.";

export default defineCard({
  name: "Goblin Kites",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [
        { kind: "permanent", filter: { type: "creature", controlledBy: "you", toughness: { op: "lte", n: 2 } } },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          {
            kind: "delayed-trigger",
            at: "next-end-step",
            text: "Flip a coin. If you lose the flip, sacrifice that creature.",
            effect: { kind: "flip-coin", lost: { kind: "sacrifice-target", target: 0 } },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
