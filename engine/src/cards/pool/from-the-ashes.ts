import { defineCard } from "../define.js";

// EDHREC rank 12442. Wave of Vitriol's shape with a destroy: every nonbasic
// land is destroyed at once, then each player may search for up to as many
// basic lands as lands of theirs were destroyed this way (a `destroyed`
// this-way entry counts for the land's controller as it left). A player who
// lost no land isn't offered the search, so doesn't shuffle.

export default defineCard({
  name: "From the Ashes",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: "Destroy all nonbasic lands. For each land destroyed this way, its controller may search their library for a basic land card and put it onto the battlefield. Then each player who searched their library this way shuffles.",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy-all", filter: { type: "land", notSupertype: "basic" } },
      {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Search your library for a basic land card for each land of yours destroyed?",
        effect: {
          kind: "conditional",
          condition: { kind: "this-way", what: "destroyed", who: "you", filter: { type: "land" }, atLeast: 1 },
          then: {
            kind: "search-library",
            filter: { type: "land", supertype: "basic" },
            destination: "battlefield",
            min: 0,
            max: { thisWay: "destroyed", who: "you", filter: { type: "land" } },
          },
        },
      },
    ],
  },
});
