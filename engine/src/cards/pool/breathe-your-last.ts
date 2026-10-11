import { defineCard } from "../define.js";

// EDHREC rank 6860.
//
// Rulings:
//   [2024-06-07] If the target is a colorless creature or planeswalker, you won't gain any life.
//
// "Its colors" are read as the permanent last existed (`colorsOf`), after it
// has been destroyed; nothing makes the life depend on the destroy working.
export default defineCard({
  name: "Breathe Your Last",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature or planeswalker. You gain 1 life for each of its colors.",
  targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: { colorsOf: 0 } },
    ],
  },
});
