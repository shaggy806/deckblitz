import { defineCard } from "../define.js";

// EDHREC rank 10116.

export default defineCard({
  name: "Shallow Grave",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return the top creature card of your graveyard to the battlefield. That creature gains haste until end of turn. Exile it at the beginning of the next end step.",
  effect: {
    kind: "top-of-graveyard",
    filter: { type: "creature" },
    then: {
      kind: "sequence",
      effects: [
        { kind: "put-onto-battlefield", target: 0 },
        { kind: "grant-keyword", target: 0, keyword: "haste", duration: "end-of-turn" },
        {
          kind: "delayed-trigger",
          at: { step: "end" },
          effect: { kind: "exile", target: 0 },
          text: "Exile it.",
        },
      ],
    },
  },
});
