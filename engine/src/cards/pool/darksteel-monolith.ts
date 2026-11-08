import { defineCard } from "../define.js";

export default defineCard({
  name: "Darksteel Monolith",
  manaCost: "{8}",
  colors: [],
  types: ["artifact"],
  keywords: ["indestructible"],
  text: "Indestructible\nOnce each turn, you may pay {0} rather than pay the mana cost for a colorless spell you cast from your hand.",
  static: [
    {
      affects: { scope: "self" },
      alternativeCostForSpells: { mana: "{0}", oncePerTurn: true, filter: { colorless: true }, when: { castFrom: "hand" } },
      text: "Once each turn, you may pay {0} rather than pay the mana cost for a colorless spell you cast from your hand.",
    },
  ],
});
