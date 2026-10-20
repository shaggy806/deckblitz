import { defineCard } from "../define.js";

// EDHREC rank 9618. The roll's result is the d20 plus the cards in your hand
// as it resolves (rule 706.2 — a modifier on the roll); the spell itself is on
// the stack by then, so it isn't counted.
export default defineCard({
  name: "Diviner's Portent",
  manaCost: "{X}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "Roll a d20 and add the number of cards in your hand.\n1—14 | Draw X cards.\n15+ | Scry X, then draw X cards.",
  targets: [],
  effect: {
    kind: "roll-dice",
    sides: 20,
    modifier: { cardsInHand: "you" },
    table: [
      { min: 1, max: 14, effect: { kind: "draw", amount: "x" } },
      {
        min: 15,
        effect: {
          kind: "sequence",
          effects: [
            { kind: "scry", amount: "x" },
            { kind: "draw", amount: "x" },
          ],
        },
      },
    ],
  },
});
