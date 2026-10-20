import { defineCard } from "../define.js";

// EDHREC rank 9715. March of the Machine Commander.
//
// Rulings:
//   [2023-04-14] If Locthwain Lancer dies at the same time as other nontoken Knights you control,
//     its ability will trigger once for itself (assuming it’s not a token) and once for each of
//     those other Knights.
//
// A leaves-the-battlefield trigger looks back in time (rule 603.10a), so the
// Lancer sees itself and every Knight dying beside it.

const TEXT = "Whenever a nontoken Knight you control dies, each opponent loses 1 life and you draw a card.";

export default defineCard({
  name: "Locthwain Lancer",
  manaCost: "{4}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 5,
  toughness: 5,
  keywords: ["menace"],
  text: `Menace\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "you-control", filter: { type: "creature", token: false, subtype: "Knight" } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
