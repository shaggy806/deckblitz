import { defineCard } from "../define.js";

const TEXT =
  "When this creature enters, if you control another Zombie, you may draw a card. If you do, discard a card.";

export default defineCard({
  name: "Lamplighter of Selhoff",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Zombie", "Horror"],
  power: 3,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      // The intervening "if" (rule 603.4): checked as it triggers and again
      // as it resolves.
      condition: { kind: "controls", filter: { subtype: "Zombie" }, atLeast: 1, excludeSelf: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Draw a card, then discard a card?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "draw", amount: 1 },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "drawn", who: "you" },
              then: { kind: "discard", target: "you", amount: 1 },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
