import { defineCard } from "../define.js";

const ENTERS_TEXT =
  "This creature enters with a +1/+1 counter on it for each other creature you control with a +1/+1 counter on it.";

export default defineCard({
  name: "Avatar of the Resolute",
  manaCost: "{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 3,
  toughness: 2,
  keywords: ["reach", "trample"],
  text: `Reach, trample\n${ENTERS_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "enters-battlefield",
        counters: {
          kind: "+1/+1",
          amount: {
            countOf: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
            excludeSelf: true,
          },
        },
      },
      text: ENTERS_TEXT,
    },
  ],
});
