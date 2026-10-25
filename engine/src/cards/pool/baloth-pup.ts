import { defineCard } from "../define.js";

// EDHREC rank 26128. Sigiled Contender's shape.

const TEXT = "This creature has trample as long as it has a +1/+1 counter on it.";

export default defineCard({
  name: "Baloth Pup",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 3,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      grantKeywords: ["trample"],
      text: TEXT,
    },
  ],
});
