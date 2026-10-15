import { defineCard } from "../define.js";

// EDHREC rank 16078.

const DIES_TEXT =
  'When this creature dies, each player creates a Lander token. (It\'s an artifact with "{2}, {T}, Sacrifice this token: Search your library for a basic land card, put it onto the battlefield tapped, then shuffle.")';

export default defineCard({
  name: "Edge Rover",
  manaCost: "{G}",
  colors: ["G"],
  types: ["artifact", "creature"],
  subtypes: ["Robot", "Scout"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Lander Token", count: 1, who: "each-player" },
      resolve: null,
      text: "When this creature dies, each player creates a Lander token.",
    },
  ],
});
