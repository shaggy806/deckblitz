import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const TAX_TEXT =
  "As long as you have an enduring story, creatures can't attack you unless their controller pays {1} for each of those creatures.";

export default defineCard({
  name: "Dáin, Lord of the Iron Hills",
  manaCost: "{1}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Noble"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance", "storied"],
  text: `Vigilance\n${STORIED_TEXT}\n${TAX_TEXT}`,
  static: [
    {
      // Ghostly Prison's tax: attacking the player, not their planeswalkers.
      affects: { scope: "self" },
      condition: { kind: "enduring-story" },
      attackTax: { generic: 1 },
      text: TAX_TEXT,
    },
  ],
});
