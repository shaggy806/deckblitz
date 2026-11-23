import { defineCard } from "../define.js";

export default defineCard({
  name: "Rat of God",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["kindred", "sorcery"],
  subtypes: ["Rat"],
  text: "Destroy all non-Rat creatures. They can't be regenerated, of course. Then each player amasses Rats X, where X is the number of Rats they control.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "destroy-all",
        filter: { type: "creature", notSubtypes: ["Rat"] },
        cantBeRegenerated: true,
      },
      {
        kind: "for-each-player",
        who: "each-player",
        effect: {
          kind: "amass",
          amount: { countOf: { subtype: "Rat", controlledBy: "you" }, forPlayer: "that-player" },
          creatureType: "Rat",
          who: "that-player",
        },
      },
    ],
  },
});
