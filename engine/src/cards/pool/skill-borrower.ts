import { defineCard } from "../define.js";

// The top card's abilities while it is an artifact or creature card, read
// live: draw it and the next one decides. One naming its card means this
// creature (the reminder text, rule 201.5b).
const GRANT_TEXT =
  "As long as the top card of your library is an artifact or creature card, this creature has all activated abilities of that card. (If any of the abilities use that card's name, use this creature's name instead.)";

export default defineCard({
  name: "Skill Borrower",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["artifact", "creature"],
  subtypes: ["Human", "Wizard"],
  power: 1,
  toughness: 3,
  text: `Play with the top card of your library revealed.\n${GRANT_TEXT}`,
  revealsOwnLibraryTop: true,
  static: [
    {
      affects: { scope: "self" },
      grantsActivatedOf: { zone: "library-top", filter: { typesAnyOf: ["artifact", "creature"] } },
      text: GRANT_TEXT,
    },
  ],
});
