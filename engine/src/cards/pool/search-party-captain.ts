import { defineCard } from "../define.js";

const COST_TEXT = "This spell costs {1} less to cast for each creature you attacked with this turn.";

export default defineCard({
  name: "Search Party Captain",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  text: `${COST_TEXT}\nWhen this creature enters, draw a card.`,
  // The `attackers` turn stat: the different creatures you declared as
  // attackers this turn (Rowdy Research's shape, yours only).
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnStat: "attackers", who: "you" },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "When this creature enters, draw a card.",
    },
  ],
});
