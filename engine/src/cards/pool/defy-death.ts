import { defineCard } from "../define.js";

export default defineCard({
  name: "Defy Death",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Return target creature card from your graveyard to the battlefield. If it's an Angel, put two +1/+1 counters on it.",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  // Fearsome Awakening's shape: the Angel check reads the permanent it became
  // (the ruling: an Angel only on the battlefield still gets the counters).
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "this-way", what: "put-onto-battlefield", filter: { subtype: "Angel" } },
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
