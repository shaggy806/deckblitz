import { defineCard } from "../define.js";

// "If it's a Dragon" reads the permanent the card became (`thisWay:
// "put-onto-battlefield"`), and the counters are put on it after it enters,
// not as it enters.

export default defineCard({
  name: "Fearsome Awakening",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield. If it's a Dragon, put two +1/+1 counters on it.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-onto-battlefield", filter: { subtype: "Dragon" } },
        then: {
          kind: "add-counter-all",
          filter: { thisWay: "put-onto-battlefield" },
          counter: "+1/+1",
          amount: 2,
        },
      },
    ],
  },
});
