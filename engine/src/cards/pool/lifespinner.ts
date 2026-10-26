import { defineCard } from "../define.js";

// EDHREC rank 20042.

const TEXT =
  "{T}, Sacrifice three Spirits: Search your library for a legendary Spirit permanent card, put it onto the battlefield, then shuffle.";

export default defineCard({
  name: "Lifespinner",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 3,
  toughness: 3,
  text: TEXT,
  activated: [
    {
      // Lifespinner is a Spirit, so it may be one of the three.
      cost: { mana: null, tap: true, sacrifice: { filter: { subtype: "Spirit" }, count: 3 } },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "legendary", subtype: "Spirit", notTypes: ["instant", "sorcery"] },
        destination: "battlefield",
        min: 0,
        max: 1,
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
