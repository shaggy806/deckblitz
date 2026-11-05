import { defineCard } from "../define.js";

const UP_TEXT =
  "When this creature is turned face up, it gets +6/+6 and gains trample until end of turn. You skip your next turn.";

export default defineCard({
  name: "Unstable Hulk",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Goblin", "Mutant"],
  power: 2,
  toughness: 2,
  morph: { keyword: "morph", cost: "{3}{R}{R}" },
  text: `Morph {3}{R}{R} (You may cast this card face down as a 2/2 creature for {3}. Turn it face up any time for its morph cost.)\n${UP_TEXT}`,
  triggered: [
    {
      trigger: { on: "turned-face-up", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "modify-pt", target: "source", power: 6, toughness: 6, duration: "end-of-turn" },
          { kind: "grant-keyword", target: "source", keyword: "trample", duration: "end-of-turn" },
          { kind: "skip-turn", who: "you" },
        ],
      },
      resolve: null,
      text: UP_TEXT,
    },
  ],
});
