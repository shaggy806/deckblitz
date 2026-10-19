import { defineCard } from "../define.js";

// EDHREC rank 25260.

export default defineCard({
  name: "Rhox Pummeler",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino", "Soldier"],
  power: 6,
  toughness: 3,
  text: "This creature enters with a shield counter on it. (If it would be dealt damage or destroyed, remove a shield counter from it instead.)\nThis creature has trample as long as it has a shield counter on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "shield", amount: 1 } },
      text: "This creature enters with a shield counter on it.",
    },
    {
      affects: { scope: "self" },
      condition: { kind: "self-counters", counter: "shield", compare: { op: "gte", n: 1 } },
      grantKeywords: ["trample"],
      text: "This creature has trample as long as it has a shield counter on it.",
    },
  ],
});
