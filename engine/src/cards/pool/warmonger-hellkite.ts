import { defineCard } from "../define.js";

// EDHREC rank 13362.
//
// The pump reads the attacking creatures as it resolves (the ruling): one
// activated before attackers are declared gives nothing to later attackers.

const MUST_ATTACK = "All creatures attack each combat if able.";
const PUMP = "{1}{R}: Attacking creatures get +1/+0 until end of turn.";

export default defineCard({
  name: "Warmonger Hellkite",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 5,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${MUST_ATTACK}\n${PUMP}`,
  static: [
    {
      affects: { scope: "all-creatures" },
      restrictions: ["must-attack"],
      text: MUST_ATTACK,
    },
  ],
  activated: [
    {
      cost: { mana: "{1}{R}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt-all",
        filter: { type: "creature", attacking: true },
        power: 1,
        toughness: 0,
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP,
    },
  ],
});
