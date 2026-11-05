import { defineCard } from "../define.js";

// EDHREC rank 30369.

export default defineCard({
  name: "Vodalian Serpent",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Serpent"],
  power: 2,
  toughness: 2,
  kicker: { cost: "{2}" },
  text: "Kicker {2} (You may pay an additional {2} as you cast this spell.)\nThis creature can't attack unless defending player controls an Island.\nIf this creature was kicked, it enters with four +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      cantAttackUnlessDefender: { controls: { subtype: "Island" } },
      text: "This creature can't attack unless defending player controls an Island.",
    },
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 4, else: 0 } },
      },
      text: "If this creature was kicked, it enters with four +1/+1 counters on it.",
    },
  ],
});
