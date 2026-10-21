import { defineCard } from "../define.js";

// EDHREC rank 29124. "Whenever you're dealt damage" is a batched damage
// trigger on the player — once per damage event, from any source, with the
// total as `triggerValue` (Risona's "whenever combat damage is dealt to you"
// without `combat`). Damage only, never life loss (the ruling). Both
// abilities are the Aura's controller's, whoever controls the artifact (the
// ruling).
//
// The upkeep "you may remove a vitality counter. If you do, you gain 1 life":
// with no vitality counter there's nothing to remove and no life.

const DAMAGE_TEXT = "Whenever you're dealt damage, put that many vitality counters on this Aura.";
const UPKEEP_TEXT =
  "At the beginning of your upkeep, you may remove a vitality counter from this Aura. If you do, you gain 1 life.";

export default defineCard({
  name: "Living Artifact",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact\n${DAMAGE_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["artifact"],
  triggered: [
    {
      trigger: { on: "deals-damage-batch", who: "any", to: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "vitality", amount: { triggerValue: true } },
      resolve: null,
      text: DAMAGE_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Remove a vitality counter from Living Artifact to gain 1 life?",
        effect: {
          kind: "conditional",
          condition: { kind: "self-counters", counter: "vitality", compare: { op: "gte", n: 1 } },
          then: {
            kind: "sequence",
            effects: [
              { kind: "remove-counter", target: "source", counter: "vitality", amount: 1 },
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
