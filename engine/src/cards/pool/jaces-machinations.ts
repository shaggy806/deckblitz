import { defineCard } from "../define.js";

const INSTANT =
  "Until end of turn, you may activate loyalty abilities of Jace planeswalkers you control on any player's turn any time you could cast an instant.";

// A timed static: Teferi, Temporal Archmage's emblem's
// `loyaltyAtInstantSpeed`, its `affects` narrowed to Jaces you control, for
// this turn — still one loyalty ability a turn each (rule 606.3).
export default defineCard({
  name: "Jace's Machinations",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["instant"],
  text: `${INSTANT}\nEmpower Jace 8. (Put eight loyalty counters on a Jace token you control. If you don't control one, first create a blue Jace planeswalker token with "[−1]: Surveil 1" and "[−3]: Draw a card.")`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "timed-static",
        duration: "end-of-turn",
        static: [
          {
            affects: { scope: "filter", filter: { type: "planeswalker", subtype: "Jace", controlledBy: "you" } },
            loyaltyAtInstantSpeed: true,
            text: INSTANT,
          },
        ],
        text: INSTANT,
      },
      { kind: "empower-jace", amount: 8 },
    ],
  },
});
