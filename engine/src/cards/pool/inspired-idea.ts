import { defineCard } from "../define.js";

// EDHREC rank 24691. Cleave (rule 702.148): cast for {3}{U}{U}, the bracketed
// hand-size clause is gone and only the draw is left. The reduction is a
// player-effect for the rest of the game, applied at its timestamp beside the
// other hand-size effects (rule 613.11).
export default defineCard({
  name: "Inspired Idea",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Cleave {3}{U}{U} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nDraw three cards. [Your maximum hand size is reduced by three for the rest of the game.]",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "draw", amount: 3 },
      { kind: "player-effect", duration: "permanent", maxHandSizeAdjust: -3 },
    ],
  },
  cleave: {
    cost: "{3}{U}{U}",
    targets: [],
    effect: { kind: "draw", amount: 3 },
  },
});
