import { defineCard } from "../define.js";

// Mirrodin (MRD). EDHREC rank 10199. Living Artifact's two abilities on an
// artifact: the damage trigger is batched (once per damage event, the total
// as its value), and the upkeep one fires on every player's upkeep.

const DAMAGE_TEXT = "Whenever you're dealt damage, put that many charge counters on this artifact.";
const UPKEEP_TEXT =
  "At the beginning of each upkeep, you may remove a charge counter from this artifact. If you do, you gain 1 life.";

export default defineCard({
  name: "Sun Droplet",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${DAMAGE_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "charge", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove a charge counter from Sun Droplet to gain 1 life?",
        effect: {
          kind: "conditional",
          condition: { kind: "self-counters", counter: "charge", compare: { op: "gte", n: 1 } },
          then: {
            kind: "sequence",
            effects: [
              { kind: "remove-counter", target: "source", counter: "charge", amount: 1 },
              { kind: "gain-life", amount: 1 },
            ],
          },
        },
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
