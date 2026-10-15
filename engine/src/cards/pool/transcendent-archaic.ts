import { defineCard } from "../define.js";

// EDHREC rank 22530.
//
// Converge: the colours of mana spent to cast it, which the permanent keeps
// from the stack; 0 for a free cast or one that wasn't cast (the rulings).
// "If you draw one or more cards this way" reads what the draw actually drew,
// so drawing none (X of 0, or an empty library) discards nothing.
const CONVERGE_TEXT =
  "Converge — When this creature enters, you may draw X cards, where X is the number of colors of mana spent to cast this spell. If you draw one or more cards this way, discard two cards.";

export default defineCard({
  name: "Transcendent Archaic",
  manaCost: "{7}",
  colors: [],
  types: ["creature"],
  subtypes: ["Avatar"],
  power: 6,
  toughness: 6,
  keywords: ["vigilance"],
  text: `Vigilance\n${CONVERGE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card for each color of mana spent to cast Transcendent Archaic, then discard two?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: { colorsSpentOf: "source" } },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", atLeast: 1 },
              then: { kind: "discard", target: "you", amount: 2 },
            },
          ],
        },
      },
      resolve: null,
      text: CONVERGE_TEXT,
    },
  ],
});
