import { defineCard } from "../define.js";

// EDHREC rank 14719.

export default defineCard({
  name: "Lethal Protection",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Destroy target creature. Return up to one target creature card from your graveyard to your hand.",
  targets: [
    "creature",
    { kind: "optional", of: { kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } } },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "return-to-hand", target: 1, from: "graveyard" },
    ],
  },
});
