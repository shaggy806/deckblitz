import { defineCard } from "../define.js";

// Rulings:
//   [2014-07-18] To double the number of +1/+1 counters on a creature, put a number of +1/+1
//     counters on it equal to the number it already has.
//   [2014-07-18] If Hydra's Growth leaves the battlefield before its enters-the-battlefield
//     triggered ability resolves, the creature it last enchanted before it left gets the +1/+1
//     counter.

const ENTER_TEXT = "When this Aura enters, put a +1/+1 counter on enchanted creature.";
const UPKEEP_TEXT = "At the beginning of your upkeep, double the number of +1/+1 counters on enchanted creature.";

export default defineCard({
  name: "Hydra's Growth",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant creature\n${ENTER_TEXT}\n${UPKEEP_TEXT}`,
  targets: ["creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: 1 },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "double-counters", target: "attached", counter: "+1/+1" },
      resolve: null,
      text: UPKEEP_TEXT,
    },
  ],
});
