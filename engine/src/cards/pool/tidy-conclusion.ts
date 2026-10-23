import { defineCard } from "../define.js";

// Kaladesh. EDHREC rank 22915. The artifacts are counted after the creature
// is destroyed, as it resolves (the ruling); an illegal target fizzles it,
// with no life gained.
export default defineCard({
  name: "Tidy Conclusion",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature. You gain 1 life for each artifact you control.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { countOf: { type: "artifact", controlledBy: "you" } } },
    ],
  },
});
