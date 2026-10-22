import { defineCard } from "../define.js";

// Lorwyn. The chosen modes resolve in printed order (the ruling): a permanent
// put on top of its owner's library is shuffled away by the third mode if
// that player is its target; the Command isn't in the graveyard yet.
const LIFE_MODE = "Target player gains 7 life.";
const TOP_MODE = "Put target noncreature permanent on top of its owner's library.";
const SHUFFLE_MODE = "Target player shuffles their graveyard into their library.";
const SEARCH_MODE = "Search your library for a creature card, reveal it, put it into your hand, then shuffle.";

export default defineCard({
  name: "Primal Command",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose two —\n• ${LIFE_MODE}\n• ${TOP_MODE}\n• ${SHUFFLE_MODE}\n• ${SEARCH_MODE}`,
  castModal: {
    minModes: 2,
    maxModes: 2,
    modes: [
      {
        text: LIFE_MODE,
        targets: ["player"],
        effect: { kind: "gain-life", amount: 7, toControllerOfTarget: 0 },
      },
      {
        text: TOP_MODE,
        targets: [{ kind: "permanent", filter: { notTypes: ["creature"] } }],
        effect: { kind: "put-on-library", target: 0, position: "top" },
      },
      {
        text: SHUFFLE_MODE,
        targets: ["player"],
        effect: { kind: "shuffle-graveyard-into-library", target: 0 },
      },
      {
        text: SEARCH_MODE,
        targets: [],
        effect: {
          kind: "search-library",
          filter: { type: "creature" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
    ],
  },
});
