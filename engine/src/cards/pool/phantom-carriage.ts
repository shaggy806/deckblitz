import { defineCard } from "../define.js";

// "A card with flashback or disturb" is either keyword as the card has it in
// the library (`hasKeyword`'s card reads); a search for a quality may find
// nothing (rule 701.23b).
const ENTERS_TEXT =
  "When this creature enters, you may search your library for a card with flashback or disturb, put it into your graveyard, then shuffle.";

export default defineCard({
  name: "Phantom Carriage",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${ENTERS_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card with flashback or disturb and put it into your graveyard?",
        effect: {
          kind: "search-library",
          filter: { anyOf: [{ hasKeyword: "flashback" }, { hasKeyword: "disturb" }] },
          destination: "graveyard",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
});
