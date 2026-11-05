import { defineCard } from "../define.js";

// EDHREC rank 18135.
//
// Each player announces in turn order, knowing the answers before theirs, and
// only then do those who said yes shuffle and draw (the ruling), as Step
// Between Worlds.

export default defineCard({
  name: "Turtles in Time",
  manaCost: "{5}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  exileOnResolve: true,
  text: "Return all creatures to their owners' hands. Each player may shuffle their hand and graveyard into their library, then each player who does draws seven cards.\nExile Turtles in Time.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand-all", filter: { type: "creature" } },
      {
        kind: "each-player-may",
        who: "each-player",
        prompt: "Shuffle your hand and graveyard into your library, then draw seven cards?",
        effect: { kind: "sequence", effects: [] },
        ifDid: {
          kind: "sequence",
          effects: [
            { kind: "shuffle-graveyard-into-library", target: "that-player", zones: ["hand", "graveyard"] },
            { kind: "draw", who: "that-player", amount: 7 },
          ],
        },
      },
    ],
  },
});
