import { defineCard } from "../define.js";

const TEXT =
  "Threshold — As long as there are seven or more cards in your graveyard, this creature gets +2/+2 and has \"When this creature dies, you lose 4 life.\"";

// Ruling: the dies trigger looks back to just before it died, so this card,
// on its way to the graveyard, never counts toward its own threshold.
export default defineCard({
  name: "Treacherous Werewolf",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Werewolf", "Minion"],
  power: 2,
  toughness: 2,
  text: TEXT,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [2, 2],
      grantsTriggered: [
        {
          trigger: { on: "dies", who: "self" },
          targets: [],
          effect: { kind: "lose-life", amount: 4 },
          resolve: null,
          text: "When this creature dies, you lose 4 life.",
        },
      ],
      text: TEXT,
    },
  ],
});
