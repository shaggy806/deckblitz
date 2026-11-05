import { defineCard } from "../define.js";

// EDHREC rank 10193.

export default defineCard({
  name: "Ironheart, Clever Champion",
  manaCost: "{4}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Hero"],
  power: 3,
  toughness: 4,
  keywords: ["flying"],
  improvise: true,
  text: "Improvise (Your artifacts can help cast this spell. Each artifact you tap after you're done activating mana abilities pays for {1}.)\nFlying\nNoncreature spells you cast have improvise.",
  static: [
    {
      affects: { scope: "self" },
      grantsToSpells: { filter: { notTypes: ["creature"] }, improvise: true },
      text: "Noncreature spells you cast have improvise.",
    },
  ],
});
