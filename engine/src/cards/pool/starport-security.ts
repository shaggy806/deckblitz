import { defineCard } from "../define.js";

const TAP =
  "{3}{W}, {T}: Tap another target creature. This ability costs {2} less to activate if you control a creature with a +1/+1 counter on it.";

export default defineCard({
  name: "Starport Security",
  manaCost: "{W}",
  colors: ["W"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Soldier"],
  power: 1,
  toughness: 1,
  text: TAP,
  activated: [
    {
      cost: { mana: "{3}{W}", tap: true },
      costReduction: {
        reduceGeneric: 2,
        condition: {
          kind: "controls",
          filter: { type: "creature", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
          atLeast: 1,
        },
      },
      targets: [{ kind: "other", of: "creature" }],
      effect: { kind: "tap", target: 0 },
      resolve: null,
      text: TAP,
    },
  ],
});
