import { defineCard } from "../define.js";

// EDHREC rank 26903. Morningtide. Skyline Scout's attack-time payment.
const ATTACK_TEXT = "Whenever this creature attacks, you may pay {W}. If you do, it gains flying until end of turn.";

export default defineCard({
  name: "Order of the Golden Cricket",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Kithkin", "Knight"],
  power: 2,
  toughness: 2,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {W} to give this creature flying until end of turn?",
        cost: "{W}",
        effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
});
