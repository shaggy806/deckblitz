import { defineCard } from "../define.js";

// EDHREC rank 11137.
//
// Shadowspear's keyword loss narrowed to nonland permanents, then Ondu
// Inversion's wrath. The loss applies first, so an opponent's indestructible
// nonland permanent is destroyed; yours keep indestructible.

export default defineCard({
  name: "Exterminatus",
  manaCost: "{5}{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  text: "Nonland permanents your opponents control lose indestructible until end of turn.\nDestroy all nonland permanents.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "lose-keywords",
        filter: { notTypes: ["land"], controlledBy: "opponent" },
        keywords: ["indestructible"],
        duration: "end-of-turn",
      },
      { kind: "destroy-all", filter: { notTypes: ["land"] } },
    ],
  },
});
