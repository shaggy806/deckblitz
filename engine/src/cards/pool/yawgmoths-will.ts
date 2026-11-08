import { defineCard } from "../define.js";

// EDHREC rank 2624.

export default defineCard({
  name: "Yawgmoth's Will",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Until end of turn, you may play lands and cast spells from your graveyard.\nIf a card would be put into your graveyard from anywhere this turn, exile that card instead.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "player-effect",
        duration: "end-of-turn",
        mayPlay: { from: "graveyard", play: true },
      },
      {
        kind: "replacement-effect",
        duration: "end-of-turn",
        replacement: { event: "would-be-put-into-graveyard", instead: "exile", filter: { ownedBy: "you", token: false } },
      },
    ],
  },
});
