import { defineCard } from "../define.js";

// EDHREC rank 12835.

export default defineCard({
  name: "Shifting Wall",
  manaCost: "{X}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Wall"],
  power: 0,
  toughness: 0,
  keywords: ["defender"],
  text: "Defender (This creature can't attack.)\nThis creature enters with X +1/+1 counters on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "+1/+1", amount: "x" } },
      text: "This creature enters with X +1/+1 counters on it.",
    },
  ],
});
