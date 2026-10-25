import { defineCard } from "../define.js";

// EDHREC rank 11467.
const PUMP_TEXT = "Discard a card: This creature gets +1/+1 until end of turn.";

export default defineCard({
  name: "Noose Constrictor",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake"],
  power: 2,
  toughness: 2,
  keywords: ["reach"],
  text: `Reach\n${PUMP_TEXT}`,
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
