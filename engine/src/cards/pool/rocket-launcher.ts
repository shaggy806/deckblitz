import { defineCard } from "../define.js";

const TEXT =
  "{2}: This artifact deals 1 damage to any target. Destroy this artifact at the beginning of the next end step. Activate only if you've controlled this artifact continuously since the beginning of your most recent turn.";

// Rule 302.6's test, asked of an artifact: a noncreature has it too.
// Each activation makes its own delayed trigger.
export default defineCard({
  name: "Rocket Launcher",
  manaCost: "{4}",
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      condition: { kind: "source", filter: { controlledContinuously: true } },
      targets: ["any-target"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "damage", amount: 1, target: 0 },
          { kind: "delayed-trigger", at: { step: "end" }, text: "Destroy this artifact.", effect: { kind: "destroy", target: "source" } },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
