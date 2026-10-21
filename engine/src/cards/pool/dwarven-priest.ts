import { defineCard } from "../define.js";

// Counted as it resolves, itself included while it's still there (the ruling).
const TEXT = "When this creature enters, you gain 1 life for each creature you control.";

export default defineCard({
  name: "Dwarven Priest",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Cleric"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "gain-life", amount: { countOf: { type: "creature", controlledBy: "you" } } },
      resolve: null,
      text: TEXT,
    },
  ],
});
