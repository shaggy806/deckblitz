import { defineCard } from "../define.js";

export default defineCard({
  name: "Fathom Trawl",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Reveal cards from the top of your library until you reveal three nonland cards. Put the nonland cards revealed this way into your hand, then put the rest of the revealed cards on the bottom of your library in any order.",
  targets: [],
  effect: {
    kind: "reveal-until-count",
    filter: { notTypes: ["land"] },
    count: 3,
    put: "hand",
    rest: "bottom-any-order",
  },
});
