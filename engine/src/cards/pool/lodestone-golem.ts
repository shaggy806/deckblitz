import { defineCard } from "../define.js";

// Every player's nonartifact spells, its controller's included (the ruling).
export default defineCard({
  name: "Lodestone Golem",
  manaCost: "{4}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 5,
  toughness: 3,
  text: "Nonartifact spells cost {1} more to cast.",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { notTypes: ["artifact"] }, increaseGeneric: 1 },
      text: "Nonartifact spells cost {1} more to cast.",
    },
  ],
});
