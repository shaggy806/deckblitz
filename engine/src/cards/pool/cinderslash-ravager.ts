import { defineCard } from "../define.js";

// EDHREC rank 24083.

const COST_TEXT = "This spell costs {1} less to cast for each permanent you control with oil counters on it.";
const ENTERS_TEXT = "When this creature enters, it deals 1 damage to each creature your opponents control.";

export default defineCard({
  name: "Cinderslash Ravager",
  manaCost: "{4}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Warrior"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `${COST_TEXT}\nVigilance\n${ENTERS_TEXT}`,
  selfCostReduction: {
    // Unconditional (Vanquish the Horde's shape): {1} less per permanent you control with an oil
    // counter on it.
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { controlledBy: "you", counters: { kind: "oil", compare: { op: "gte", n: 1 } } } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage-all", amount: 1, filter: { type: "creature", controlledBy: "opponent" } },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
