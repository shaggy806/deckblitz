import { defineCard } from "../define.js";

// Nemesis (NEM). EDHREC rank 23796.
//
// The search's filter names the target's name (`sameNameAsTarget`, bound as
// the effect applies — rule 201.2a).

export default defineCard({
  name: "Pack Hunt",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to three cards with the same name as target creature, reveal them, put them into your hand, then shuffle.",
  targets: ["creature"],
  effect: {
    kind: "search-library",
    filter: { sameNameAsTarget: 0 },
    destination: "hand",
    min: 0,
    max: 3,
    reveal: true,
  },
});
