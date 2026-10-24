import { defineCard } from "../define.js";

// EDHREC rank 22997. Sphinx Summoner's tutor, for any
// creature card with the Assembly-Worker subtype — not Mishra's Factory, a
// land (the ruling).
const TEXT =
  "When this creature enters, you may search your library for an Assembly-Worker creature card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Self-Assembler",
  manaCost: "{5}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Assembly-Worker"],
  power: 4,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for an Assembly-Worker creature card?",
        effect: {
          kind: "search-library",
          filter: { type: "creature", subtype: "Assembly-Worker" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
