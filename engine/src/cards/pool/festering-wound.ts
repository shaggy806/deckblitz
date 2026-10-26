import { defineCard } from "../define.js";

// Urza's Destiny. EDHREC rank 22581.
//
// Rulings:
//   [2004-10-04] If it is on your creature, you can decide whether to add a counter before or
//     after it damages you.
//   [2004-10-04] Putting on a counter is optional. If you forget, you can't go back later even if
//     it is something you usually do.
//
// The damage trigger is Maddening Wind's (the upkeep of whoever controls the
// enchanted creature), its X the Aura's infection counters as it resolves. On
// your own creature both trigger in your upkeep and you order them.

const COUNTER_TEXT = "At the beginning of your upkeep, you may put an infection counter on this Aura.";
const DAMAGE_TEXT =
  "At the beginning of the upkeep of enchanted creature's controller, this Aura deals X damage to that player, where X is the number of infection counters on this Aura.";

export default defineCard({
  name: "Festering Wound",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${COUNTER_TEXT}\n${DAMAGE_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put an infection counter on Festering Wound?",
        effect: { kind: "add-counter", target: "source", counter: "infection", amount: 1 },
      },
      resolve: null,
      text: COUNTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      whileCondition: { kind: "source", filter: { attachedTo: { controlledBy: "active-player" } } },
      targets: [],
      effect: {
        kind: "damage",
        amount: { countersOn: "source", counter: "infection" },
        who: "active-player",
      },
      resolve: null,
      text: DAMAGE_TEXT,
    },
  ],
});
