import { defineCard } from "../define.js";

// EDHREC rank 18765.

const TEXT =
  "Whenever this creature attacks, you may have it get +4/+0 until end of turn. If you do, sacrifice it at the beginning of the next end step.";

export default defineCard({
  name: "Attack-in-the-Box",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Toy"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Have Attack-in-the-Box get +4/+0 until end of turn, and sacrifice it at the beginning of the next end step?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "modify-pt", target: "source", power: 4, toughness: 0, duration: "end-of-turn" },
            {
              // Only this object (rule 400.7): one that has left and come
              // back by then isn't sacrificed.
              kind: "delayed-trigger",
              at: "next-end-step",
              effect: { kind: "sacrifice-source" },
              text: "Sacrifice Attack-in-the-Box.",
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
