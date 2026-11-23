import { defineCard } from "../define.js";

const SACRIFICED_FOOD = { turnHistory: "sacrificed", who: "you", filter: { subtype: "Food" } } as const;

export default defineCard({
  name: "Gingerbehemoth",
  manaCost: "{6}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Food", "Golem"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance", "trample"],
  text: "Gingerbehemoth costs {2} less to cast for each Food you've sacrificed this turn.\nVigilance, trample\n{4}, {T}, Sacrifice Gingerbehemoth: You gain 6 life.",
  selfCostReduction: {
    condition: { kind: "turn-history", what: "sacrificed", who: "you", filter: { subtype: "Food" }, atLeast: 1 },
    reduceGeneric: { product: [2, SACRIFICED_FOOD] },
  },
  activated: [
    {
      cost: { mana: "{4}", tap: true, sacrifice: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: 6 },
      resolve: null,
      text: "{4}, {T}, Sacrifice Gingerbehemoth: You gain 6 life.",
    },
  ],
});
