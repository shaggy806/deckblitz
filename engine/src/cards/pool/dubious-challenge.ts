import { defineCard } from "../define.js";

// Exiled face up, then the target opponent may take one under their control and
// what's left comes to you; with only one exiled, they choose who gets it (the
// rulings). The exile links to nothing else, so it's `unlinked`.
export default defineCard({
  name: "Dubious Challenge",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text:
    "Look at the top ten cards of your library, exile up to two creature cards from among them, then shuffle. Target " +
    "opponent may choose one of the exiled cards and put it onto the battlefield under their control. Put the rest " +
    "onto the battlefield under your control.",
  targets: ["opponent"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "look-and-choose",
        zone: "library",
        count: 10,
        min: 0,
        max: 2,
        filter: { type: "creature" },
        destination: "exile",
        unlinked: true,
        leftover: "stay",
      },
      { kind: "shuffle-library" },
      {
        kind: "for-each-player",
        who: { target: 0 },
        effect: {
          kind: "look-and-choose",
          zone: "exile",
          chooser: "that-player",
          min: 0,
          max: 1,
          filter: { thisWay: "exiled" },
          destination: "battlefield",
          leftover: "stay",
        },
      },
      {
        kind: "look-and-choose",
        zone: "exile",
        min: 2,
        max: 2,
        filter: { thisWay: "exiled" },
        destination: "battlefield",
        leftover: "stay",
      },
    ],
  },
});
