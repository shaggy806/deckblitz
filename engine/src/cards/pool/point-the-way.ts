import { defineCard } from "../define.js";
import { START_YOUR_ENGINES_TEXT } from "../helpers.js";

// EDHREC rank 13310. X is the speed as the ability resolves (0 with none,
// rule 702.179f) — the enchantment was sacrificed to pay for it, which
// changes nothing: losing it doesn't lower the speed (the rulings).
const SEARCH_TEXT =
  "{3}{G}, Sacrifice this enchantment: Search your library for up to X basic land cards, where X is your speed. Put those cards onto the battlefield tapped, then shuffle.";

export default defineCard({
  name: "Point the Way",
  manaCost: "{G}",
  colors: ["G"],
  types: ["enchantment"],
  keywords: ["start-your-engines"],
  text: `${START_YOUR_ENGINES_TEXT}\n${SEARCH_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false, sacrifice: "self" },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", supertype: "basic" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: { speed: "you" },
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
});
