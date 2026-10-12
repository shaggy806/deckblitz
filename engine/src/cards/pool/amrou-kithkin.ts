import { defineCard } from "../define.js";

export default defineCard({
  name: "Amrou Kithkin",
  manaCost: "{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin"],
  power: 1,
  toughness: 1,
  text: "This creature can't be blocked by creatures with power 3 or greater.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "gte", n: 3 } },
      text: "This creature can't be blocked by creatures with power 3 or greater.",
    },
  ],
});
