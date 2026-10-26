import { defineCard } from "../define.js";

export default defineCard({
  name: "Mwonvuli Acid-Moss",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target land. Search your library for a Forest card, put that card onto the battlefield tapped, then shuffle.",
  targets: ["land"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "search-library",
        filter: { subtype: "Forest" },
        destination: "battlefield",
        enterTapped: true,
        min: 0,
        max: 1,
      },
    ],
  },
});
