import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 30210.
//
// Rulings:
//   [2008-10-01] The -0/-1 counters stay on the creature even if Essence Flare is removed.
//
// Unstable Mutation's upkeep trigger: the counters go on the creature itself,
// so they stay when the Aura leaves; the +2/+0 goes with the Aura.

const TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, put a -0/-1 counter on that creature.";

export default defineCard({
  name: "Essence Flare",
  manaCost: "{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\nEnchanted creature gets +2/+0.\n${TEXT}`,
  targets: ["creature"],
  static: [{ affects: { scope: "attached" }, grantPt: [2, 0], text: "Enchanted creature gets +2/+0." }],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "-0/-1", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
