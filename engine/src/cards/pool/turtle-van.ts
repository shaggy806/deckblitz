import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

const ATTACK_TEXT =
  "Whenever this Vehicle attacks, put a +1/+1 counter on target creature that crewed it this turn. Then if that creature is a Mutant, Ninja, or Turtle, double the number of +1/+1 counters on it.";

export default defineCard({
  name: "Turtle Van",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 4,
  toughness: 4,
  text: `${ATTACK_TEXT}\n${crewText(1)}`,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [{ kind: "permanent", filter: { type: "creature", crewedSource: true } }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { subtypes: ["Mutant", "Ninja", "Turtle"] } },
            then: { kind: "double-counters", target: 0, counter: "+1/+1" },
          },
        ],
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  activated: [crew(1, crewText(1))],
});
