import { defineCard } from "../define.js";

export default defineCard({
  name: "Enraged Ceratok",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Rhino"],
  power: 4,
  toughness: 4,
  text: "This creature can't be blocked by creatures with power 2 or less.",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
