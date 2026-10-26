import { defineCard } from "../define.js";

// The right half of Crime // Punishment.
const FACES = ["Crime // Punishment", "Crime", "Punishment"];

export default defineCard({
  name: "Punishment",
  manaCost: "{X}{B}{G}",
  colors: ["B", "G"],
  types: ["sorcery"],
  text: "Destroy each artifact, creature, and enchantment with mana value X.",
  targets: [],
  effect: {
    kind: "destroy-all",
    filter: { typesAnyOf: ["artifact", "creature", "enchantment"], manaValue: { op: "eq", n: "x" } },
  },
  faces: FACES,
  split: true,
});
