import { defineCard } from "../define.js";

const FACES = ["Bound // Determined", "Bound", "Determined"];

// The right half of Bound // Determined (see bound-determined.ts). A
// `grant-spells-this-turn` without `next` reaches every spell its controller
// controls on the stack for the rest of the turn, those already there and
// those cast later (Veil of Summer's reading); Determined itself has left the
// stack by then, so "other" needs nothing more. A spell that would counter
// one still resolves, without countering it (the rulings, rule 701.5f).
export default defineCard({
  name: "Determined",
  manaCost: "{G}{U}",
  colors: ["U", "G"],
  types: ["instant"],
  text: "Other spells you control can't be countered this turn.\nDraw a card.",
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "grant-spells-this-turn", cantBeCountered: true },
      { kind: "draw", amount: 1 },
    ],
  },
  faces: FACES,
  split: true,
});
