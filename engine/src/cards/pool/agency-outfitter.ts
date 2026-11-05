import { defineCard } from "../define.js";
import { searchZonesAndOr } from "../helpers.js";

const ENTERS =
  "When this creature enters, you may search your graveyard, hand and/or library for a card named Magnifying Glass and/or a card named Thinking Cap and put them onto the battlefield. If you search your library this way, shuffle.";

export default defineCard({
  name: "Agency Outfitter",
  manaCost: "{4}{U}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Sphinx", "Detective"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${ENTERS}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your graveyard, hand, and/or library for Magnifying Glass and/or Thinking Cap?",
        effect: searchZonesAndOr(["graveyard", "hand", "library"], {
          kind: "search-library",
          filter: { anyOf: [{ name: "Magnifying Glass" }, { name: "Thinking Cap" }] },
          together: { distinctNames: true },
          destination: "battlefield",
          min: 0,
          max: 2,
        }),
      },
      resolve: null,
      text: ENTERS,
    },
  ],
});
