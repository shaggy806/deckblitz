import { defineCard } from "../define.js";

// Kicker—Return a creature you control to its owner's hand (rule 702.33a):
// `also.returnToHand`, which creature chosen as the cost is paid once the
// spell is on the stack (601.2h).

export default defineCard({
  name: "Arctic Merfolk",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk"],
  power: 1,
  toughness: 1,
  kicker: {
    cost: "",
    also: { text: "Return a creature you control to its owner's hand", returnToHand: { filter: { type: "creature" }, count: 1 } },
  },
  text: "Kicker—Return a creature you control to its owner's hand. (You may return a creature you control to its owner's hand in addition to any other costs as you cast this spell.)\nIf this creature was kicked, it enters with a +1/+1 counter on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: { kind: "+1/+1", amount: { ifCondition: { kind: "self-kicked" }, then: 1, else: 0 } },
      },
      text: "If this creature was kicked, it enters with a +1/+1 counter on it.",
    },
  ],
});
