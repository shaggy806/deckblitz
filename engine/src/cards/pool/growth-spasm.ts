import { defineCard } from "../define.js";

// EDHREC rank 7211. The Spawn is made whether or not a land was found (the
// ruling).
export default defineCard({
  name: "Growth Spasm",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Search your library for a basic land card, put it onto the battlefield tapped, then shuffle. Create a 0/1 colorless Eldrazi Spawn creature token. It has \"Sacrifice this token: Add {C}.\"",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "battlefield",
        min: 0,
        max: 1,
        enterTapped: true,
      },
      { kind: "create-token", token: "Eldrazi Spawn Token", count: 1 },
    ],
  },
});
