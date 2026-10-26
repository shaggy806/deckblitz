import { defineCard } from "../define.js";

const TEXT = "Creatures with power less than this creature's power can't block it.";

export default defineCard({
  name: "Wandering Wolf",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wolf"],
  power: 2,
  toughness: 1,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      cantBeBlockedBy: { power: { op: "lt", n: { amount: { powerOf: "source" } } } },
      text: TEXT,
    },
  ],
});
