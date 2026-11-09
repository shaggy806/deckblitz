import { defineCard } from "../define.js";

export default defineCard({
  name: "Lifestream's Blessing",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["instant"],
  foretell: { cost: "{4}{G}" },
  text: "Draw X cards, where X is the greatest power among creatures you controlled as you cast this spell. If this spell was cast from exile, you gain twice X life.\nForetell {4}{G} (During your turn, you may pay {2} and exile this card from your hand face down. Cast it on a later turn for its foretell cost.)",
  asCast: [{ amount: { aggregate: "max", of: "power", filter: { type: "creature", controlledBy: "you" } } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: { asCast: 0 } },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { castFrom: "exile" } },
        then: { kind: "gain-life", amount: { product: [2, { asCast: 0 }] } },
      },
    ],
  },
});
