import { defineCard } from "../define.js";

export default defineCard({
  name: "Adaptive Shimmerer",
  manaCost: "{5}",
  colors: [],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 0,
  toughness: 0,
  keywords: ["flash"],
  text: "Flash\nThis creature enters with three +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: 3 } },
      text: "This creature enters with three +1/+1 counters on it.",
    },
  ],
});
