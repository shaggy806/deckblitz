import { defineCard } from "../define.js";

// X is the arrow counters on the Aura that grants the ability (rule 201.5a),
// read as it last existed if it has left by then (608.2h).

const UPKEEP = "At the beginning of your upkeep, you may put an arrow counter on this Aura.";
const GRANTED =
  "{T}: This creature deals X damage to target attacking or blocking creature, where X is the number of arrow counters on Archery Training.";
const TEXT = `Enchanted creature has "${GRANTED}"`;

export default defineCard({
  name: "Archery Training",
  manaCost: "{W}",
  colors: ["W"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${UPKEEP}\n${TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Put an arrow counter on Archery Training?",
        effect: { kind: "add-counter", target: "source", counter: "arrow", amount: 1 },
      },
      resolve: null,
      text: UPKEEP,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: ["attacking-or-blocking-creature"],
          effect: { kind: "damage", amount: { countersOn: "granter", counter: "arrow" }, target: 0 },
          resolve: null,
          text: GRANTED,
        },
      ],
      text: TEXT,
    },
  ],
});
