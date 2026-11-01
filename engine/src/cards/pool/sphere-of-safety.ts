import { defineCard } from "../define.js";

const TEXT =
  "Creatures can't attack you or planeswalkers you control unless their controller pays {X} for each of those creatures, where X is the number of enchantments you control.";

// X is read as attackers are declared, itself among the enchantments.
export default defineCard({
  name: "Sphere of Safety",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      attackTax: { generic: { countOf: { type: "enchantment", controlledBy: "you" } }, covers: "you-and-planeswalkers" },
      text: TEXT,
    },
  ],
});
