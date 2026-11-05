import { defineCard } from "../define.js";

// EDHREC rank 10844.
//
// Each player announces in turn order, knowing the answers before theirs, and
// only then do those who said yes shuffle and draw (the ruling): the question
// has nothing of its own to do, and the shuffle and the draw are its `ifDid`.

export default defineCard({
  name: "Step Between Worlds",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  plot: { cost: "{4}{U}{U}" },
  exileOnResolve: true,
  text: "Each player may shuffle their hand and graveyard into their library. Each player who does draws seven cards. Exile Step Between Worlds.\nPlot {4}{U}{U} (You may pay {4}{U}{U} and exile this card from your hand. Cast it as a sorcery on a later turn without paying its mana cost. Plot only as a sorcery.)",
  targets: [],
  effect: {
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
});
