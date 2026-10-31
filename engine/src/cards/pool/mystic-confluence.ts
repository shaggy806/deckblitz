import { defineCard } from "../define.js";

// "You may choose the same mode more than once" (rule 700.2d): each copy of
// a targeted mode has its own target, the same one or another — two bounce
// modes may name two creatures, and two counter modes the same spell (its
// controller asked to pay {3} twice).
const MODE_COUNTER = "Counter target spell unless its controller pays {3}.";
const MODE_BOUNCE = "Return target creature to its owner's hand.";
const MODE_DRAW = "Draw a card.";

export default defineCard({
  name: "Mystic Confluence",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `Choose three. You may choose the same mode more than once.\n• ${MODE_COUNTER}\n• ${MODE_BOUNCE}\n• ${MODE_DRAW}`,
  castModal: {
    minModes: 3,
    maxModes: 3,
    repeatModes: true,
    modes: [
      {
        text: MODE_COUNTER,
        targets: ["spell"],
        effect: { kind: "unless", chooser: 0, options: [{ pay: "{3}", text: "Pay {3}" }], otherwise: { kind: "counter", target: 0 } },
      },
      { text: MODE_BOUNCE, targets: ["creature"], effect: { kind: "return-to-hand", target: 0 } },
      { text: MODE_DRAW, effect: { kind: "draw", amount: 1 } },
    ],
  },
});
