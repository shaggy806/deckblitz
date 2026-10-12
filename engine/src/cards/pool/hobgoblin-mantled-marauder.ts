import { defineCard } from "../define.js";

// EDHREC rank 8795.

// One trigger per card discarded (`perCard`).
const PUMP_TEXT = "Whenever you discard a card, Hobgoblin gets +2/+0 until end of turn.";

export default defineCard({
  name: "Hobgoblin, Mantled Marauder",
  manaCost: "{1}{R}",
  colors: ["R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Goblin", "Human", "Villain"],
  power: 1,
  toughness: 2,
  keywords: ["flying", "haste"],
  text: `Flying, haste\n${PUMP_TEXT}`,
  triggered: [
    {
      trigger: { on: "discards", who: "you", perCard: true },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
