import { defineCard } from "../define.js";

const PUMP_TEXT = "Discard a card: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Hell Mongrel",
  manaCost: "{3}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Nightmare", "Dog"],
  power: 4,
  toughness: 3,
  madness: { cost: "{2}{B}" },
  text: `${PUMP_TEXT}
Madness {2}{B} (If you discard this card, discard it into exile. When you do, cast it for its madness cost or put it into your graveyard.)`,
  activated: [
    {
      cost: { mana: null, tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 1, duration: "end-of-turn" },
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
