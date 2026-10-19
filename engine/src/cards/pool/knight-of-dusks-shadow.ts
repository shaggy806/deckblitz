import { defineCard } from "../define.js";

// EDHREC rank 10268.
const LOCK_TEXT = "Your opponents can't gain life.";
const PUMP_TEXT = "{1}{B}: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Knight of Dusk's Shadow",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Knight"],
  power: 2,
  toughness: 2,
  keywords: ["menace"],
  text: `Menace (This creature can't be blocked except by two or more creatures.)\n${LOCK_TEXT}\n${PUMP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-gain-life", who: "opponent", prevent: true },
      text: LOCK_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
