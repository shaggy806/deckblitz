import { defineCard } from "../define.js";

// Straight from the stack to the hand as it resolves, never the graveyard; if
// its target is illegal it doesn't resolve and goes to the graveyard (the rulings).
export default defineCard({
  name: "View from Above",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Target creature gains flying until end of turn. If you control a white permanent, return View from Above to its owner's hand.",
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
      {
        kind: "conditional",
        condition: { kind: "controls", filter: { colors: ["W"] }, atLeast: 1 },
        then: { kind: "return-to-hand", target: "source", from: "stack" },
      },
    ],
  },
});
