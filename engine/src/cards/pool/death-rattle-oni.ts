import { defineCard } from "../define.js";

const ENTER = "When this creature enters, destroy all other creatures that were dealt damage this turn.";

export default defineCard({
  name: "Death-Rattle Oni",
  manaCost: "{6}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Demon", "Spirit"],
  power: 5,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\nThis spell costs {2} less to cast for each creature that died this turn.\n${ENTER}`,
  selfCostReduction: {
    condition: { kind: "controls", filter: {}, atLeast: 0 },
    reduceGeneric: { turnHistory: "died", who: "any-player", filter: { type: "creature" }, times: 2 },
  },
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "destroy-all", filter: { type: "creature", damagedThisTurnBy: {} }, exceptSource: true },
      resolve: null,
      text: ENTER,
    },
  ],
});
