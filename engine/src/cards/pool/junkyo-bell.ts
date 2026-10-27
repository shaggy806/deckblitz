import { defineCard } from "../define.js";

// Champions of Kamigawa. EDHREC rank 23086. The target is chosen as the
// trigger goes on the stack; "you may" and X (the creatures you control) as
// it resolves. Soulshriek's pump-then-delayed-sacrifice, under the `may`.

const TEXT =
  "At the beginning of your upkeep, you may have target creature you control get +X/+X until end of turn, where X is the number of creatures you control. If you do, sacrifice that creature at the beginning of the next end step.";
const X = { countOf: { type: "creature", controlledBy: "you" } } as const;

export default defineCard({
  name: "Junkyo Bell",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["creature-you-control"],
      effect: {
        kind: "may",
        prompt: "Give the creature +X/+X, sacrificing it at the next end step?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
            {
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-target", target: 0 },
              text: "Sacrifice the creature Junkyo Bell pumped.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
