import { defineCard } from "../define.js";

// EDHREC rank 3292. The Desert count is read after the search, so Deserts
// it found count (the ruling).

const TEXT =
  "Search your library for up to two land cards, put them onto the battlefield tapped, then shuffle. Then if you control three or more Deserts, create two 2/2 black Zombie creature tokens.";

export default defineCard({
  name: "Hour of Promise",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: TEXT,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "search-library", filter: { type: "land" }, destination: "battlefield", enterTapped: true, min: 0, max: 2 },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { subtype: "Desert" }, atLeast: 3 },
        then: { kind: "create-token", token: "Zombie Token", count: 2 },
      },
    ],
  },
});
