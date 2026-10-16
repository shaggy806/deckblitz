import { defineCard } from "../define.js";

const CRIME_TEXT =
  "Whenever you commit a crime, put a +1/+1 counter on this creature. This ability triggers only once each turn.";
const DRAIN_TEXT = "{3}{B}: Target opponent loses 1 life and you gain 1 life.";

// Activating its own drain targets an opponent: a crime, so it feeds itself.
export default defineCard({
  name: "Blood Hustler",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire", "Rogue"],
  power: 1,
  toughness: 1,
  text: `${CRIME_TEXT} (Targeting opponents, anything they control, and/or cards in their graveyards is a crime.)\n${DRAIN_TEXT}`,
  triggered: [
    {
      trigger: { on: "crime-committed", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "+1/+1", amount: 1 },
      resolve: null,
      oncePerTurn: true,
      text: CRIME_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{B}", tap: false },
      targets: ["opponent"],
      effect: {
        kind: "sequence",
        effects: [{ kind: "lose-life", amount: 1, target: 0 }, { kind: "gain-life", amount: 1 }],
      },
      resolve: null,
      text: DRAIN_TEXT,
    },
  ],
});
