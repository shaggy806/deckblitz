import { defineCard } from "../define.js";

// EDHREC rank 26715.
//
// "It" is the permanent that became tapped. The upkeep's removal reaches the
// permanents the player whose upkeep it is controls (`controlledBy:
// "active-player"`), every hourglass counter on each.
const TAPPED_TEXT = "Whenever a creature or land becomes tapped, put an hourglass counter on it.";
const UNTAP_TEXT = "Each permanent with an hourglass counter on it doesn't untap during its controller's untap step.";
const UPKEEP_TEXT =
  "At the beginning of each player's upkeep, remove all hourglass counters from permanents that player controls.";

export default defineCard({
  name: "Temporal Distortion",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${TAPPED_TEXT}\n${UNTAP_TEXT}\n${UPKEEP_TEXT}`,
  triggered: [
    {
      trigger: { on: "becomes-tapped", who: "any", filter: { typesAnyOf: ["creature", "land"] } },
      targets: [],
      effect: { kind: "add-counter", target: "trigger-object", counter: "hourglass", amount: 1 },
      resolve: null,
      text: TAPPED_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "remove-counter-all",
        filter: { controlledBy: "active-player" },
        counter: "hourglass",
        amount: "all",
      },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "filter", filter: { counters: { kind: "hourglass", compare: { op: "gte", n: 1 } } } },
      restrictions: ["doesnt-untap"],
      text: UNTAP_TEXT,
    },
  ],
});
