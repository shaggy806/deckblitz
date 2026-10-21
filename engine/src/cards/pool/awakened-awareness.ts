import { defineCard } from "../define.js";

// Rulings:
//   [2022-02-18] The enchanted creature's toughness becomes 1 before the triggered ability that
//     puts counters on it goes on the stack.
//   [2022-02-18] Awakened Awareness will overwrite any previous effects that set the enchanted
//     creature's power and toughness to specific numbers (layer 7b; counters and bonuses still
//     apply).

const COUNTERS_TEXT = "When this Aura enters, put X +1/+1 counters on enchanted permanent.";
const BASE_TEXT = "As long as enchanted permanent is a creature, it has base power and toughness 1/1.";

export default defineCard({
  name: "Awakened Awareness",
  manaCost: "{X}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant artifact or creature\n${COUNTERS_TEXT}\n${BASE_TEXT}`,
  targets: ["artifact-or-creature"],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "add-counter", target: "attached", counter: "+1/+1", amount: "x" },
      resolve: null,
      text: COUNTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "attached" },
      condition: { kind: "source", filter: { attachedTo: { type: "creature" } } },
      setBasePt: { power: 1, toughness: 1 },
      text: BASE_TEXT,
    },
  ],
});
