import { defineCard } from "../define.js";

export default defineCard({
  name: "Greater Sandwurm",
  manaCost: "{5}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 7,
  toughness: 7,
  cycling: { cost: "{2}" },
  text: "This creature can't be blocked by creatures with power 2 or less.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lte", n: 2 } },
      text: "This creature can't be blocked by creatures with power 2 or less.",
    },
  ],
});
