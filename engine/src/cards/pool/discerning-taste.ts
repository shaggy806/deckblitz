import { defineCard } from "../define.js";

// EDHREC rank 15151. Commune with Evil's look, then life equal to the greatest
// power among the creature cards that went to the graveyard, each read as it is
// there. None, or a greatest power below 0, is no life (rule 107.1b).

export default defineCard({
  name: "Discerning Taste",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text:
    "Look at the top four cards of your library. Put one of them into your hand and the rest into your graveyard. " +
    "You gain life equal to the greatest power among creature cards put into your graveyard this way.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "look-and-choose", zone: "library", count: 4, min: 1, max: 1, destination: "hand", leftover: "graveyard" },
      {
        kind: "gain-life",
        amount: {
          aggregate: "max",
          of: "power",
          filter: { type: "creature" },
          in: { thisWay: "put-into-graveyard", who: "you" },
        },
      },
    ],
  },
});
