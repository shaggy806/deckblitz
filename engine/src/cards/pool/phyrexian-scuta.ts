import { defineCard } from "../define.js";

// Planeshift (PLS). EDHREC rank 29289.
//
// A kicker of life alone: no mana part, the 3 life paid as it's cast.

export default defineCard({
  name: "Phyrexian Scuta",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Phyrexian", "Zombie"],
  power: 3,
  toughness: 3,
  kicker: { cost: "", also: { text: "Pay 3 life", payLife: 3 } },
  text: "Kicker—Pay 3 life. (You may pay 3 life in addition to any other costs as you cast this spell.)\nIf this creature was kicked, it enters with two +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 2, else: 0 } },
      },
      text: "If this creature was kicked, it enters with two +1/+1 counters on it.",
    },
  ],
});
