import { defineCard } from "../define.js";

// EDHREC rank 29046. "If you do" reads whether a card was actually discarded:
// with an empty hand nothing is, and it stays tapped.

const UPKEEP_TEXT = "At the beginning of your upkeep, you may discard a card. If you do, untap this artifact.";

export default defineCard({
  name: "Elaborate Firecannon",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `This artifact doesn't untap during your untap step.\n{4}, {T}: This artifact deals 2 damage to any target.\n${UPKEEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      doesntUntap: true,
      text: "This artifact doesn't untap during your untap step.",
    },
  ],
  activated: [
    {
      cost: { mana: "{4}", tap: true },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 2, target: 0 },
      resolve: null,
      text: "{4}, {T}: This artifact deals 2 damage to any target.",
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Discard a card to untap Elaborate Firecannon?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard", target: "you", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "discarded" },
              then: { kind: "untap", target: "source" },
            },
          ],
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
