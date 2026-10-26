import { defineCard } from "../define.js";

const TEXT = "This creature can't be blocked except by creatures with flying or reach.";

export default defineCard({
  name: "Orchard Spirit",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { notKeyword: "flying", anyOf: [{ notKeyword: "reach" }] },
      text: TEXT,
    },
  ],
});
