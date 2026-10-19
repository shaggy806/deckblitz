import { defineCard } from "../define.js";

// EDHREC rank 10359.
//
// Knight of the White Orchid's trigger, the land entering tapped. The
// intervening if (rule 603.4) is checked as it triggers and again as it
// resolves (the ruling). "A Plains card" is any card with the Plains subtype,
// basic or not.

const CONCEALED_TEXT =
  "Concealed Position — When this creature enters, if an opponent controls more lands than you, you may search your library for a Plains card, put it onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Space Marine Scout",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Astartes", "Scout"],
  power: 2,
  toughness: 1,
  keywords: ["first-strike", "vigilance"],
  text: `First strike, vigilance\n${CONCEALED_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "opponent-controls-more", filter: { type: "land" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a Plains card?",
        effect: {
          kind: "search-library",
          filter: { subtype: "Plains" },
          destination: "battlefield",
          min: 0,
          max: 1,
          enterTapped: true,
        },
      },
      resolve: null,
      text: CONCEALED_TEXT,
    },
  ],
});
