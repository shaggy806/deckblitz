import { defineCard } from "../define.js";

export default defineCard({
  name: "Arlinn's Wolf",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 3,
  toughness: 2,
  text: "This creature can't be blocked by creatures with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
