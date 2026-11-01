import { defineCard } from "../define.js";

// Each opponent chooses in turn, knowing the choices before theirs, and only
// then do the chosen cards enter, all at once (the ruling, rule 101.4).
export default defineCard({
  name: "Dredge the Mire",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Each opponent chooses a creature card in their graveyard. Put those cards onto the battlefield under your control.",
  effect: {
    kind: "for-each-player",
    who: "each-opponent",
    choicesHeld: true,
    effect: {
      kind: "look-and-choose",
      player: "that-player",
      zone: "graveyard",
      min: 1,
      max: 1,
      filter: { type: "creature" },
      destination: "battlefield",
      under: "you",
      leftover: "stay",
    },
  },
});
