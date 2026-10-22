import { defineCard } from "../define.js";

// EDHREC rank 22175. Amonkhet. The return finds the Trial only if it's still
// on the battlefield as the ability resolves (the ruling).
const ENTER_TEXT = "When this enchantment enters, draw three cards, then discard a card.";
const RETURN_TEXT = "When a Cartouche you control enters, return this enchantment to its owner's hand.";

export default defineCard({
  name: "Trial of Knowledge",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: `${ENTER_TEXT}\n${RETURN_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "discard", target: "you", amount: 1 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
    {
      trigger: { on: "enters-battlefield", who: "you-control", filter: { subtype: "Cartouche" } },
      targets: [],
      effect: { kind: "return-to-hand", target: "source" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
