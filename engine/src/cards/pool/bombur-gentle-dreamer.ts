import { defineCard } from "../define.js";
import { STORIED_TEXT } from "../helpers.js";

const UNTAP_TEXT = "Bombur doesn't untap during your untap step unless you have an enduring story.";

export default defineCard({
  name: "Bombur, Gentle Dreamer",
  manaCost: "{2}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 5,
  toughness: 3,
  keywords: ["storied"],
  text: `${STORIED_TEXT}\n${UNTAP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "not", of: { kind: "enduring-story" } },
      doesntUntap: true,
      text: UNTAP_TEXT,
    },
  ],
});
