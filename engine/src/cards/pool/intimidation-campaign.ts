import { defineCard } from "../define.js";

// EDHREC rank 15891. The bounce is optional, and only from the battlefield:
// `return-to-hand` of the source finds nothing once it has left.
const ENTER_TEXT = "When this enchantment enters, each opponent loses 1 life, you gain 1 life, and you draw a card.";
const CRIME_TEXT = "Whenever you commit a crime, you may return this enchantment to its owner's hand.";

export default defineCard({
  name: "Intimidation Campaign",
  manaCost: "{1}{U}{B}",
  colors: ["U", "B"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${CRIME_TEXT} (It returns only from the battlefield. Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return Intimidation Campaign to its owner's hand?",
        effect: { kind: "return-to-hand", target: "source" },
      },
      resolve: null,
      text: CRIME_TEXT,
    },
  ],
});
