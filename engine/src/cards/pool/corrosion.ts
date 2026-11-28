import { defineCard } from "../define.js";
import { cumulativeUpkeep } from "../helpers.js";

// EDHREC rank 27523. Every artifact with enough rust counters is destroyed,
// your own too, and every rust counter on any permanent comes off as it
// leaves (the rulings).

const RUST_TEXT =
  "At the beginning of your upkeep, put a rust counter on each artifact target opponent controls. Then destroy each artifact with mana value less than or equal to the number of rust counters on it. Artifacts destroyed this way can't be regenerated.";
const LEAVES_TEXT = "When this enchantment leaves the battlefield, remove all rust counters from all permanents.";

const upkeep = cumulativeUpkeep("{1}");

export default defineCard({
  name: "Corrosion",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["enchantment"],
  text: `${upkeep.text}\n${RUST_TEXT}\n${LEAVES_TEXT}`,
  triggered: [
    upkeep,
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter-all", filter: { type: "artifact", controlledBy: "you" }, counter: "rust", amount: 1, controlledByTarget: 0 },
          {
            kind: "destroy-all",
            filter: { type: "artifact", manaValue: { op: "lte", n: { ownCounters: "rust" } } },
            cantBeRegenerated: true,
          },
        ],
      },
      resolve: null,
      text: RUST_TEXT,
    },
    {
      trigger: { on: "leaves-battlefield", who: "self" },
      targets: [],
      effect: { kind: "remove-counter-all", filter: {}, counter: "rust", amount: "all" },
      resolve: null,
      text: LEAVES_TEXT,
    },
  ],
});
