import { defineCard } from "../define.js";

export default defineCard({
  name: "Chaos Imps",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 6,
  toughness: 5,
  keywords: ["flying", "unleash"],
  text: "Flying\nUnleash (You may have this creature enter with a +1/+1 counter on it. It can't block as long as it has a +1/+1 counter on it.)\nThis creature has trample as long as it has a +1/+1 counter on it.",
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "+1/+1", compare: { op: "gte", n: 1 } },
      grantKeywords: ["trample"],
      text: "This creature has trample as long as it has a +1/+1 counter on it.",
    },
  ],
});
