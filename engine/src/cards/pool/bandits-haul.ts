import { defineCard } from "../define.js";

const CRIME_TEXT =
  "Whenever you commit a crime, put a loot counter on this artifact. This ability triggers only once each turn.";
const DRAW_TEXT = "{2}, {T}, Remove two loot counters from this artifact: Draw a card.";

export default defineCard({
  name: "Bandit's Haul",
  manaCost: "{3}",
  colors: [],
  types: ["artifact"],
  text: `${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)\n{T}: Add one mana of any color.\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "loot", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: CRIME_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: "any-color", amount: 1 },
      resolve: null,
      text: "{T}: Add one mana of any color.",
    },
    {
      cost: { mana: "{2}", tap: true, removeCounter: { kind: "loot", count: 2 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
