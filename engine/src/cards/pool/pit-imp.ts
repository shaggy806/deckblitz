import { defineCard } from "../define.js";

// EDHREC rank 30727.
//
// The limit counts activations, not resolutions, and stays with this
// permanent through a change of control (rule 602.5b): two each turn,
// anyone's turn.
const PUMP_TEXT = "{B}: This creature gets +1/+0 until end of turn. Activate no more than twice each turn.";

export default defineCard({
  name: "Pit Imp",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 0,
  toughness: 1,
  keywords: ["flying"],
  text: `Flying\n${PUMP_TEXT}`,
  activated: [
    {
      cost: { mana: "{B}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      timesEachTurn: 2,
      resolve: null,
      text: PUMP_TEXT,
    },
  ],
});
