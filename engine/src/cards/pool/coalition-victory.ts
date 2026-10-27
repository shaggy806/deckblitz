import { defineCard } from "../define.js";

const land = (subtype: string) => ({ kind: "controls", filter: { type: "land", subtype }, atLeast: 1 }) as const;
const creature = (color: "W" | "U" | "B" | "R" | "G") =>
  ({ kind: "controls", filter: { type: "creature", colors: [color] }, atLeast: 1 }) as const;

// Checked as it resolves; one land of several basic types counts for each, one
// multicolored creature for each of its colors (the ruling).
export default defineCard({
  name: "Coalition Victory",
  manaCost: "{3}{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  types: ["sorcery"],
  text: "You win the game if you control a land of each basic land type and a creature of each color.",
  targets: [],
  effect: {
    kind: "conditional",
    condition: {
      kind: "all",
      of: [
        land("Plains"),
        land("Island"),
        land("Swamp"),
        land("Mountain"),
        land("Forest"),
        creature("W"),
        creature("U"),
        creature("B"),
        creature("R"),
        creature("G"),
      ],
    },
    then: { kind: "win-game" },
  },
});
