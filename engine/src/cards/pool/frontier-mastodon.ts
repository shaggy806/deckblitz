import { defineCard } from "../define.js";

// Ascendant Packleader's shape: read as it enters, so it never counts itself
// (the ruling).

export default defineCard({
  name: "Frontier Mastodon",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Elephant"],
  power: 3,
  toughness: 2,
  text: "Ferocious — This creature enters with a +1/+1 counter on it if you control a creature with power 4 or greater.",
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            ifCondition: {
              kind: "controls",
              filter: { type: "creature", controlledBy: "you", power: { op: "gte", n: 4 } },
              atLeast: 1,
            },
            then: 1,
            else: 0,
          },
        },
      },
      text: "Ferocious — This creature enters with a +1/+1 counter on it if you control a creature with power 4 or greater.",
    },
  ],
});
