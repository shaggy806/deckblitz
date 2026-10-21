import { defineCard } from "../define.js";

const TEXT = "When you gain life for the first time each turn, return this card from your graveyard to your hand.";

export default defineCard({
  name: "Deathless Knight",
  manaCost: "{B/G}{B/G}{B/G}{B/G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Skeleton", "Knight"],
  power: 4,
  toughness: 2,
  keywords: ["haste"],
  text: `Haste\n${TEXT}`,
  triggered: [
    {
      // Works only from the graveyard, and only on the turn's first gain:
      // a gain earlier in the turn uses it up (its rulings).
      fromGraveyard: true,
      trigger: { on: "gains-life", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: TEXT,
    },
  ],
});
