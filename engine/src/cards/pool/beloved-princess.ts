import { defineCard } from "../define.js";

export default defineCard({
  name: "Beloved Princess",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Noble"],
  power: 1,
  toughness: 1,
  keywords: ["lifelink"],
  text: "Lifelink\nThis creature can't be blocked by creatures with power 3 or greater.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 3 } },
      text: "This creature can't be blocked by creatures with power 3 or greater.",
    },
  ],
});
