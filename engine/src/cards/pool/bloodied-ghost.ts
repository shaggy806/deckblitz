import { defineCard } from "../define.js";

export default defineCard({
  name: "Bloodied Ghost",
  manaCost: "{1}{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nThis creature enters with a -1/-1 counter on it.",
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "enters-battlefield", counters: { kind: "-1/-1", amount: 1 } },
      text: "This creature enters with a -1/-1 counter on it.",
    },
  ],
});
