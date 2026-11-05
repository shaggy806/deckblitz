import { defineCard } from "../define.js";

const TEXT = "At the beginning of your upkeep, flip a coin. If you lose the flip, turn this creature face down.";

export default defineCard({
  name: "Skittish Valesk",
  manaCost: "{6}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Beast"],
  power: 5,
  toughness: 5,
  text: `${TEXT}\nMorph {5}{R}`,
  morph: { keyword: "morph", cost: "{5}{R}" },
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "you" },
      targets: [],
      effect: { kind: "flip-coin", lost: { kind: "turn-face-down", target: "source" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
