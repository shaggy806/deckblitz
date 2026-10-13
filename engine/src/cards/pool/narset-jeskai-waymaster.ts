import { defineCard } from "../define.js";

// EDHREC rank 12047.
//
// Rulings:
//   [2025-04-04] You may choose to discard your hand even if your hand contains zero cards.

const END_TEXT =
  "At the beginning of your end step, you may discard your hand. If you do, draw cards equal to the number of spells you've cast this turn.";

export default defineCard({
  name: "Narset, Jeskai Waymaster",
  manaCost: "{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Monk"],
  power: 3,
  toughness: 4,
  text: END_TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      // Saying yes with an empty hand still "does" it (the ruling).
      effect: {
        kind: "may",
        prompt: "Discard your hand, then draw a card for each spell you've cast this turn?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "discard-hand", who: "you" },
            { kind: "draw", amount: { turnStat: "spells-cast" } },
          ],
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
