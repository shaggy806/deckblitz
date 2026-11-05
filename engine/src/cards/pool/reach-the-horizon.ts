import { defineCard } from "../define.js";

export default defineCard({
  name: "Reach the Horizon",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for up to two basic land cards and/or Town cards with different names, put them onto the battlefield tapped, then shuffle.",
  targets: [],
  effect: {
    kind: "search-library",
    filter: { anyOf: [{ supertype: "basic", type: "land" }, { subtype: "Town" }] },
    destination: "battlefield",
    enterTapped: true,
    min: 0,
    max: 2,
    together: { distinctNames: true },
  },
});
