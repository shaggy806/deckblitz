import { defineCard } from "../define.js";

// EDHREC rank 24924. "That spell's controller" is read as the spell last
// existed once it's countered (rule 608.2h).

export default defineCard({
  name: "Vex",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Counter target spell. That spell's controller may draw a card.",
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "counter", target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        prompt: "Draw a card?",
        effect: { kind: "draw", amount: 1 },
      },
    ],
  },
});
