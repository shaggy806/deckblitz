import { defineCard } from "../define.js";

// EDHREC rank 15900. Infusion is read as the spell resolves; the controller
// is read off the destroyed creature as it last existed (Hideous End's
// shape). An illegal target fizzles the whole spell (the ruling).

export default defineCard({
  name: "Foolish Fate",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Destroy target creature.\nInfusion — If you gained life this turn, that creature's controller loses 3 life.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "destroy", target: 0 },
      {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
        then: { kind: "lose-life", amount: 3, toControllerOfTarget: 0 },
      },
    ],
  },
});
