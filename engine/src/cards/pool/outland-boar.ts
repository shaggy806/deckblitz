import { defineCard } from "../define.js";

export default defineCard({
  name: "Outland Boar",
  manaCost: "{2}{R}{G}",
  colors: ["R", "G"],
  types: ["creature"],
  subtypes: ["Boar"],
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
