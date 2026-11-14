import { defineCard } from "../define.js";

const TEXT =
  "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Open an Attraction. (Put the top card of your Attraction deck onto the battlefield.)";

export default defineCard({
  name: "Coming Attraction",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      { kind: "open-attraction" },
    ],
  },
});
