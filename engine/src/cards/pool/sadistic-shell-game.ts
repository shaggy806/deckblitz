import { defineCard } from "../define.js";

// EDHREC rank 5382.
// Not targeted: each player knows the choices before theirs (the ruling); the chosen creatures are
// destroyed at once.

export default defineCard({
  name: "Sadistic Shell Game",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Starting with the next opponent in turn order, each player chooses a creature you don't control. Destroy the chosen creatures.",
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "vote",
        choose: true,
        startingWith: "next-opponent",
        for: { permanent: { type: "creature", controlledBy: "opponent" } },
      },
      { kind: "for-each-voted", which: "voted", simultaneous: true, effect: { kind: "destroy", target: 0 } },
    ],
  },
});
