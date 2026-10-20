import { defineCard } from "../define.js";

// EDHREC rank 20176.
//
// The Angel or Berserker needn't still be under your control, and may have
// entered before Cleaving Reaper reached the graveyard (the ruling): the
// turn's record of what entered under your control.
const RETURN_TEXT =
  "Pay 3 life: Return this card from your graveyard to your hand. Activate only if you had an Angel or Berserker enter the battlefield under your control this turn.";

export default defineCard({
  name: "Cleaving Reaper",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Angel", "Berserker"],
  power: 5,
  toughness: 3,
  keywords: ["flying", "trample"],
  text: `Flying, trample\n${RETURN_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: false, payLife: 3 },
      zone: "graveyard",
      staysInZone: true,
      condition: {
        kind: "turn-history",
        what: "entered",
        who: "you",
        filter: { subtypes: ["Angel", "Berserker"] },
        atLeast: 1,
      },
      targets: [],
      effect: { kind: "return-to-hand", target: "source", from: "graveyard" },
      resolve: null,
      text: RETURN_TEXT,
    },
  ],
});
