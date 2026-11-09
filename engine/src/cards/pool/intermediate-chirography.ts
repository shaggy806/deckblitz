import { defineCard } from "../define.js";
import { atLevel, classLevel } from "../helpers.js";

const LEVEL_2 = "Whenever you lose life for the first time each turn, put a +1/+1 counter on target creature you control.";
const LEVEL_3 =
  "At the beginning of each end step, if a modified creature died under your control this turn, create a 2/1 white and black Inkling creature token with flying. (Equipment, Auras you control, and counters are modifications.)";

// EDHREC rank 18224. A Class (rule 716).
export default defineCard({
  name: "Intermediate Chirography",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["enchantment"],
  subtypes: ["Class"],
  text: `(Gain the next level as a sorcery to add its ability.)\nWhen this Class enters, create a 2/1 white and black Inkling creature token with flying.\n{1}{B}: Level 2\n${LEVEL_2}\n{2}{B}: Level 3\n${LEVEL_3}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Inkling Token", count: 1 },
      resolve: null,
      text: "When this Class enters, create a 2/1 white and black Inkling creature token with flying.",
    },
    atLevel(2, {
      trigger: { on: "loses-life", who: "you", firstTimeEachTurn: true },
      targets: ["creature-you-control"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      resolve: null,
      text: LEVEL_2,
    }),
    atLevel(3, {
      trigger: { on: "step-begins", step: "end", who: "any" },
      condition: { kind: "turn-history", what: "died", who: "you", filter: { type: "creature", modified: true } },
      targets: [],
      effect: { kind: "create-token", token: "Inkling Token", count: 1 },
      resolve: null,
      text: LEVEL_3,
    }),
  ],
  activated: [classLevel(2, "{1}{B}"), classLevel(3, "{2}{B}")],
});
