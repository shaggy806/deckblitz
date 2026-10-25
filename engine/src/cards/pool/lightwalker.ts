import { defineCard } from "../define.js";

// EDHREC rank 27697. Baloth Pup's shape.
export default defineCard({
  name: "Lightwalker",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 1,
  text: "This creature has flying as long as it has a +1/+1 counter on it.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      grantKeywords: ["flying"],
      text: "This creature has flying as long as it has a +1/+1 counter on it.",
    },
  ],
});
