import { defineCard } from "../define.js";

const TEXT =
  "Whenever a green nontoken creature dies, that creature's controller may search their library for a card with the same name as that creature, put it onto the battlefield, then shuffle.";

// Any player's creature. "That creature's controller" and its name are as it
// last existed (rule 608.2h), and the search is theirs, whoever controls this.
export default defineCard({
  name: "Verdant Succession",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "dies", who: "any", filter: { type: "creature", colors: ["G"], token: false } },
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "trigger-controller",
        prompt: "Search your library for a card with the same name as that creature and put it onto the battlefield?",
        effect: {
          kind: "search-library",
          filter: { sameNameWith: "trigger-object" },
          destination: "battlefield",
          min: 0,
          max: 1,
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
