import { defineCard } from "../define.js";

// EDHREC rank 19717. Ajani's Response's target cost reduction over a
// graveyard target; with the target gone it doesn't resolve and no life is
// gained (the ruling).

export default defineCard({
  name: "Revoke Demise",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "This spell costs {2} less to cast if it targets a creature card with mana value 3 or less.\nReturn target creature card from your graveyard to the battlefield. You gain 2 life.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  targetCostReduction: { filter: { type: "creature", manaValue: { op: "lte", n: 3 } }, reduceGeneric: 2 },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
