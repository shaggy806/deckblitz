import { defineCard } from "../define.js";

// EDHREC rank 27085.

// "Its controller may search": their choice (`each-player-may`), so
// declining neither searches nor shuffles their library.
export default defineCard({
  name: "70,000 Light-Years from Home",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Exile target creature or Spacecraft. Its controller may search their library for a basic land card, reveal it, put it into their hand, then shuffle.",
  targets: [{ kind: "permanent", filter: { anyOf: [{ type: "creature" }, { subtype: "Spacecraft" }] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOf: 0 },
        prompt: "Search your library for a basic land card?",
        effect: {
          kind: "search-library",
          filter: { type: "land", supertype: "basic" },
          destination: "hand",
          min: 0,
          max: 1,
          reveal: true,
        },
      },
    ],
  },
});
