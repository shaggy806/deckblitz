import { defineCard } from "../define.js";

// The target opponent picks from their own graveyard; the card comes to you.
export default defineCard({
  name: "Scrounge",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Target opponent chooses an artifact card in their graveyard. Put that card onto the battlefield under your control.",
  targets: ["opponent"],
  effect: {
    kind: "for-each-player",
    who: { target: 0 },
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "graveyard",
      min: 1,
      max: 1,
      filter: { type: "artifact" },
      destination: "battlefield",
      under: "you",
      leftover: "stay",
    },
  },
});
