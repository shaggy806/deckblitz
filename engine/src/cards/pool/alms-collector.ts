import { defineCard } from "../define.js";

const TEXT = "If an opponent would draw two or more cards, instead you and that player each draw a card.";

export default defineCard({
  name: "Alms Collector",
  manaCost: "{3}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Cat", "Cleric"],
  power: 3,
  toughness: 4,
  keywords: ["flash"],
  text: `Flash\n${TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: {
        event: "would-draw",
        who: "opponent",
        instruction: { atLeast: 2 },
        instead: {
          effect: {
            kind: "sequence",
            effects: [
              { kind: "draw", amount: 1 },
              { kind: "draw", amount: 1, who: "trigger-player" },
            ],
          },
        },
      },
      text: TEXT,
    },
  ],
});
