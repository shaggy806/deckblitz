import { defineCard } from "../define.js";

export default defineCard({
  name: "Imperiosaur",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dinosaur"],
  power: 5,
  toughness: 5,
  text: "Spend only mana produced by basic lands to cast this spell.",
  spendOnlyManaFrom: { type: "land", supertype: "basic" },
});
