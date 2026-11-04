import { defineCard } from "../define.js";

const DISCARD_TEXT =
  "If a spell or ability an opponent controls causes you to discard a card, you may reveal that card and put it on top of your library instead of putting it anywhere else.";

// Rulings:
//   When you apply Nephalia Academy's effect, the card was still discarded. Abilities that trigger
//     when a card is discarded will still trigger.
//   If you discard a card with madness, you'll choose whether to exile it or put it on top of your
//     library. If you put it on top of your library, you can't cast it using madness.
export default defineCard({
  name: "Nephalia Academy",
  types: ["land"],
  text: `${DISCARD_TEXT}\n{T}: Add {C}.`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-discard", causedBy: "opponent", reveal: true },
      text: DISCARD_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "C", amount: 1 },
      resolve: null,
      text: "{T}: Add {C}.",
    },
  ],
});
