import { defineCard } from "../define.js";

// EDHREC rank 32092.

const PUMP_TEXT = "{1}{B}, Discard a card: This creature gets +2/+2 until end of turn.";

export default defineCard({
  name: "Stalking Bloodsucker",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Vampire"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{B}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 2, toughness: 2, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
