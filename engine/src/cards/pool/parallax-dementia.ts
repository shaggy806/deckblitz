import { defineCard } from "../define.js";

// EDHREC rank 28363.
//
// Fading 1 (rule 702.32a) is its two pieces: the enters-with-counters
// replacement and the upkeep trigger, whose "if you can't" is read as it
// resolves. "Enchanted creature" in the leaves trigger is the creature the
// Aura was last attached to (`"attached"` reads it after the Aura has gone).

const FADING = "Fading 1";
const FADING_UPKEEP = "At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.";
const PUMP = "Enchanted creature gets +3/+2.";
const LEAVES = "When this Aura leaves the battlefield, destroy enchanted creature. That creature can't be regenerated.";

export default defineCard({
  name: "Parallax Dementia",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nFading 1 (This enchantment enters with one fade counter on it. At the beginning of your upkeep, remove a fade counter from it. If you can't, sacrifice it.)\n${PUMP}\n${LEAVES}`,
  targets: ["creature"],
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "fade", amount: 1 } },
      text: FADING,
    },
    { affects: { scope: "attached" }, grantPt: [3, 2], text: PUMP },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "self-counters", counter: "fade", compare: { op: "gte", n: 1 } },
        then: { kind: "remove-counter", target: "source", counter: "fade", amount: 1 },
        else: { kind: "sacrifice-source" },
      },
      resolve: null,
      text: FADING_UPKEEP,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "destroy", target: "attached", cantBeRegenerated: true },
      resolve: null,
      text: LEAVES,
    },
  ],
});
