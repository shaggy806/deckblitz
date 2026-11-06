import { defineCard } from "../define.js";

const TEXT =
  "When The Doctor enters, put a +1/+1 counter on target creature. Then put a +1/+1 counter on each creature you control with a counter on it.";

export default defineCard({
  name: "The Doctor, EMH",
  manaCost: "{3}{G/W}{G/W}",
  colors: ["W", "G"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Illusion", "Doctor"],
  power: 3,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
          // "A counter": any kind, read after the first counter lands.
          {
            kind: "add-counter-all",
            filter: { type: "creature", controlledBy: "you", counters: { compare: { op: "gte", n: 1 } } },
            counter: "+1/+1",
            amount: 1,
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
