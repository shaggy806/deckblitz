import { defineCard } from "../define.js";

// Core Set 2020. Terminal Criticism's shape: an indestructible target still
// gains you the life; an illegal one means the spell doesn't resolve.
export default defineCard({
  name: "Noxious Grasp",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature or planeswalker that's green or white. You gain 1 life.",
  targets: [
    {
      kind: "permanent",
      whose: "any",
      filter: { typesAnyOf: ["creature", "planeswalker"], anyOf: [{ colors: ["G"] }, { colors: ["W"] }] },
    },
  ],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "gain-life", amount: 1 },
    ],
  },
});
