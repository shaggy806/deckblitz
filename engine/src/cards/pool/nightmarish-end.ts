import { defineCard } from "../define.js";

// X is read as the spell resolves (the ruling), with the spell on the stack rather than in hand.
const X = { product: [{ cardsInHand: "you" }, -1] } as const;

export default defineCard({
  name: "Nightmarish End",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Target creature gets -X/-X until end of turn, where X is the number of cards in your hand.",
  targets: ["creature"],
  effect: { kind: "modify-pt", target: 0, power: X, toughness: X, duration: "end-of-turn" },
});
