import { defineCard } from "../define.js";

const TEXT = "Blue spells you cast cost {U} more to cast.";

export default defineCard({
  name: "Sapphire Leech",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Leech"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { colors: ["U"] }, increaseColored: "{U}", when: { caster: "you" } },
      text: TEXT,
    },
  ],
});
