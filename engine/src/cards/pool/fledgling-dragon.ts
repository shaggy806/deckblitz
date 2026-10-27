import { defineCard } from "../define.js";

// EDHREC rank 21675.
//
// Threshold's +3/+3 and the firebreathing ability are one conditional static:
// the ability exists only while there are seven or more cards in your
// graveyard (a pump already resolved lasts the turn either way).

const PUMP_TEXT = "{R}: This creature gets +1/+0 until end of turn.";
const THRESHOLD_TEXT = `Threshold — As long as there are seven or more cards in your graveyard, this creature gets +3/+3 and has "${PUMP_TEXT}"`;

export default defineCard({
  name: "Fledgling Dragon",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${THRESHOLD_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      condition: { kind: "threshold" },
      grantPt: [3, 3],
      grantsActivated: [
        {
          cost: { mana: "{R}", tap: false },
          targets: [],
          effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
          resolve: null,
          text: PUMP_TEXT,
        },
      ],
      text: THRESHOLD_TEXT,
    },
  ],
});
