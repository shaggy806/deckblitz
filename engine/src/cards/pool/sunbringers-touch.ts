import { defineCard } from "../define.js";

// EDHREC rank 25104. X is the cards in your hand as it resolves (the ruling);
// the trample goes to every creature you control with a +1/+1 counter then,
// the bolstered one included.
export default defineCard({
  name: "Sunbringer's Touch",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Bolster X, where X is the number of cards in your hand. Each creature you control with a +1/+1 counter on it gains trample until end of turn. (To bolster X, choose a creature with the least toughness among creatures you control and put X +1/+1 counters on it.)",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "bolster", amount: { cardsInHand: "you" } },
      {
        kind: "grant-keyword-all",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
        keyword: "trample",
        duration: "end-of-turn",
      },
    ],
  },
});
