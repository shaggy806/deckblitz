import { defineCard } from "../define.js";

// A modal spell (rules 700.2a, 601.2b): one or both modes chosen as it's cast,
// each with its own target. The second mode's "you may have it become no
// longer suspected" is asked as it resolves (rule 701.60a).

const DESTROY_TEXT = "Destroy target creature.";
const COUNTER_TEXT =
  "Put a +1/+1 counter on target suspected creature you control. You may have it become no longer suspected.";

export default defineCard({
  name: "Deadly Complication",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: `Choose one or both —\n• ${DESTROY_TEXT}\n• ${COUNTER_TEXT}`,
  targets: [],
  castModal: {
    minModes: 1,
    maxModes: 2,
    modes: [
      { text: DESTROY_TEXT, targets: ["creature"], effect: { kind: "destroy", target: 0 } },
      {
        text: COUNTER_TEXT,
        targets: [{ kind: "permanent", whose: "you", filter: { type: "creature", suspected: true } }],
        effect: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
            {
              kind: "may",
              prompt: "Have it become no longer suspected?",
              effect: { kind: "unsuspect", target: 0 },
            },
          ],
        },
      },
    ],
  },
});
