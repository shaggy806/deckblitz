import { defineCard } from "../define.js";
import { crew, crewText } from "../helpers.js";

// EDHREC rank 17564.

const ETB_TEXT =
  "When this Vehicle enters, you may pay {G}. If you do, search your library for a basic land card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Subway Train",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Vehicle"],
  power: 3,
  toughness: 1,
  text: `${ETB_TEXT}\n${crewText(2)}`,
  activated: [crew(2)],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {G} to search your library for a basic land card?",
        cost: "{G}",
        effect: {
          kind: "search-library",
          filter: { supertype: "basic", type: "land" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
