import { defineCard } from "../define.js";

// Fifth Dawn (5DN). EDHREC rank 31773.

const PUMP_TEXT = "Discard an artifact card: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Fleshgrafter",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 2,
  toughness: 2,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1, filter: { type: "artifact" } } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
