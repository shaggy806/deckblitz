import { defineCard } from "../define.js";

const REDUCE = "This spell costs {1} less to cast for each creature attacking you.";
const ENTER = "When this creature enters, you get {E} for each creature attacking you.";
const COMBAT =
  "At the beginning of combat on your turn, you may pay {E}{E}{E}. If you do, put a +1/+1 counter on each creature you control.";

export default defineCard({
  name: "Sentry Bot",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot"],
  power: 2,
  toughness: 5,
  keywords: ["flash"],
  text: `Flash\n${REDUCE}\n${ENTER}\n${COMBAT}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { countOf: { type: "creature", attackingYou: true } },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      // Counted as it resolves (the ruling).
      effect: { kind: "get-energy", amount: { countOf: { type: "creature", attackingYou: true } } },
      resolve: null,
      text: ENTER,
    },
    {
      trigger: { on: "step-begins", step: "begin-combat", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {E}{E}{E} to put a +1/+1 counter on each creature you control?",
        costEnergy: 3,
        effect: { kind: "add-counter-all", filter: { type: "creature", controlledBy: "you" }, counter: "+1/+1", amount: 1 },
      },
      resolve: null,
      text: COMBAT,
    },
  ],
});
