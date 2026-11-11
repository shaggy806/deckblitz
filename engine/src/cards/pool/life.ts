import { defineCard } from "../define.js";

const FACES = ["Life // Death", "Life", "Death"];

// The left half of Life // Death (see life-death.ts).
//
// Rulings:
//   [2022-12-08] Lands that become creatures retain any other supertypes, card types, subtypes,
//     and abilities they have.
export default defineCard({
  name: "Life",
  manaCost: "{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "All lands you control become 1/1 creatures until end of turn. They're still lands.",
  targets: [],
  effect: {
    kind: "become",
    filter: { type: "land", controlledBy: "you" },
    power: 1,
    toughness: 1,
    addTypes: ["creature"],
    duration: "end-of-turn",
  },
  faces: FACES,
  split: true,
});
