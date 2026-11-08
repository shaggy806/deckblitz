import { defineCard } from "../define.js";

const TEXT =
  "Whenever a nontoken creature you control dies, you may search your library for a card with the same name as that creature, reveal it, put it into your hand, then shuffle.";

// "That creature" is named as it last existed on the battlefield (rule 608.2h):
// a Clone that died a copy of Grizzly Bears finds a Grizzly Bears, and one that
// died face down had no name for a card to share (rule 201.2a).
export default defineCard({
  name: "Remembrance",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Search your library for a card with the same name as that creature?",
        effect: {
          kind: "search-library",
          filter: { sameNameWith: "trigger-object" },
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
