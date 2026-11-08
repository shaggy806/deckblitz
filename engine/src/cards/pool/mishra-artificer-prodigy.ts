import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

// "That spell" is the spell that fired the trigger, its name as it is now or
// as it last existed (`sameNameAsTriggerObject`, rule 201.2a): a countered one
// still has its name.

const CAST =
  "Whenever you cast an artifact spell, you may search your graveyard, hand, and/or library for a card with the same name as that spell and put it onto the battlefield. If you search your library this way, shuffle.";

export default defineCard({
  name: "Mishra, Artificer Prodigy",
  manaCost: "{1}{U}{B}{R}",
  colors: ["U", "B", "R"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Human", "Artificer"],
  power: 4,
  toughness: 4,
  text: CAST,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { type: "artifact" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your graveyard, hand, and/or library for a card with the same name as that spell?",
        effect: searchZonesAndOr(["graveyard", "hand", "library"], {
          kind: "search-library",
          filter: { sameNameWith: "trigger-object" },
          destination: "battlefield",
          min: 0,
          max: 1,
        }),
      },
      resolve: null,
      text: CAST,
    },
  ],
});
