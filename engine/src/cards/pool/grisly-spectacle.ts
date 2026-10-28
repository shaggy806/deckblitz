import { defineCard } from "../define.js";

// Rivals of Ixalan (RIX). EDHREC rank 11928. The power and the controller are
// read as the destroyed creature last existed on the battlefield (the ruling,
// rule 608.2h).

export default defineCard({
  name: "Grisly Spectacle",
  manaCost: "{2}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target nonartifact creature. Its controller mills cards equal to that creature's power.",
  targets: ["nonartifact-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "mill", target: 0, amount: { powerOf: 0 } },
    ],
  },
});
