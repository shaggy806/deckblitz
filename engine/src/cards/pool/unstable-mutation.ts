import { defineCard } from "../define.js";

// EDHREC rank 25675. The upkeep trigger is Wanderlust's shape: each upkeep,
// with "the enchanted creature's controller is the active player" as part of
// the trigger condition (rule 603.1). The -1/-1 counters are put on the
// creature itself, so they stay if the Aura leaves (its ruling); the +3/+3
// goes with the Aura.

const TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, put a -1/-1 counter on that creature.";

export default defineCard({
  name: "Unstable Mutation",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +3/+3.\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [3, 3], text: "Enchanted creature gets +3/+3." }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "-1/-1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
