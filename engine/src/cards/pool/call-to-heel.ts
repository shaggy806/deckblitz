import { defineCard } from "../define.js";

// The creature's controller — not necessarily its owner, to whose
// hand it goes — draws, read as it last existed on the battlefield (rule
// 608.2h).

const TEXT = "Return target creature to its owner's hand. Its controller draws a card.";

export default defineCard({
  name: "Call to Heel",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "return-to-hand", target: 0 },
      { kind: "draw", who: { controllerOfTarget: 0 }, amount: 1 },
    ],
  },
});
