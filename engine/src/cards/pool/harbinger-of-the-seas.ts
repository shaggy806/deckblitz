import { defineCard } from "../define.js";

// Rule 305.7, as Blood Moon: nonbasic lands lose their other land types and
// rules-text abilities, gain "{T}: Add {U}", and enter with none of their own
// entering abilities (the rulings). Names and supertypes are untouched.
export default defineCard({
  name: "Harbinger of the Seas",
  manaCost: "{1}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 2,
  text: "Nonbasic lands are Islands.",
  static: [
    {
      affects: { scope: "filter", filter: { type: "land", notSupertype: "basic" } },
      setSubtypes: ["Island"],
      text: "Nonbasic lands are Islands.",
    },
  ],
});
