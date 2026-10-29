import { defineCard } from "../define.js";

// Shadowmoor (SHM). EDHREC rank 20105.
//
// In order: the token first, so the black-and-red Elemental counts for both
// sacrifices (the ruling); each count is read from your side as it comes.
export default defineCard({
  name: "Din of the Fireherd",
  manaCost: "{5}{B/R}{B/R}{B/R}",
  colors: ["B", "R"],
  types: ["sorcery"],
  text: "Create a 5/5 black and red Elemental creature token. Target opponent sacrifices a creature of their choice for each black creature you control, then sacrifices a land of their choice for each red creature you control.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Elemental Token (Din of the Fireherd)", count: 1 },
      {
        kind: "sacrifice",
        who: "target",
        filter: { type: "creature" },
        count: { countOf: { type: "creature", controlledBy: "you", colors: ["B"] } },
      },
      {
        kind: "sacrifice",
        who: "target",
        filter: { type: "land" },
        count: { countOf: { type: "creature", controlledBy: "you", colors: ["R"] } },
      },
    ],
  },
});
