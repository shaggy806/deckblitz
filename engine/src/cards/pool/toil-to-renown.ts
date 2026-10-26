import { defineCard } from "../define.js";

// EDHREC rank 27842. Each tapped permanent counts once, whichever of the three
// types it has (a tapped artifact creature is one permanent).

export default defineCard({
  name: "Toil to Renown",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "You gain 1 life for each tapped artifact, creature, and land you control.",
  targets: [],
  effect: {
    kind: "gain-life",
    amount: {
      countOf: { typesAnyOf: ["artifact", "creature", "land"], tapped: true, controlledBy: "you" },
    },
  },
});
