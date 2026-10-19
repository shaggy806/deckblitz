import { defineCard } from "../define.js";

// EDHREC rank 28800.
//
// The bonus is counted once, as the ability resolves (rule 608.2h), and
// stays for the turn.

const PUMP_TEXT =
  "Domain — {3}{G}: Until end of turn, this creature gets +1/+1 for each basic land type among lands you control. Activate only once each turn.";

export default defineCard({
  name: "Sunbathing Rootwalla",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 2,
  toughness: 2,
  text: PUMP_TEXT,
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { basicLandTypes: "you" },
        toughness: { basicLandTypes: "you" },
        duration: "end-of-turn",
      },
      resolve: null,
      text: PUMP_TEXT,
      oncePerTurn: true,
    },
  ],
});
