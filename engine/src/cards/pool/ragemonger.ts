import { defineCard } from "../define.js";

// EDHREC rank 17116. Bard Class's colored-only reduction, for Minotaurs.

export default defineCard({
  name: "Ragemonger",
  manaCost: "{1}{B}{R}",
  colors: ["B", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Shaman"],
  power: 2,
  toughness: 3,
  text: "Minotaur spells you cast cost {B}{R} less to cast. This effect reduces only the amount of colored mana you pay. (For example, if you cast a Minotaur spell with mana cost {2}{R}, it costs {2} to cast.)",
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: { subtype: "Minotaur" }, caster: "you", reduceColored: "{B}{R}", coloredOnly: true },
      text: "Minotaur spells you cast cost {B}{R} less to cast. This effect reduces only the amount of colored mana you pay.",
    },
  ],
});
