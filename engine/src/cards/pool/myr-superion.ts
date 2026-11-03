import { defineCard } from "../define.js";

export default defineCard({
  name: "Myr Superion",
  manaCost: "{2}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Myr"],
  power: 5,
  toughness: 6,
  text: "Spend only mana produced by creatures to cast this spell.",
  spendOnlyManaFrom: { type: "creature" },
});
