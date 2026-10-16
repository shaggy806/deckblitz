import { defineCard } from "../define.js";

// Bloomburrow (BLB). EDHREC rank 13716. Bristlebane Outrider's "another creature
// entered the battlefield under your control this turn", as an intervening "if" (rule
// 603.4) on the attack trigger. A creature that entered and has since left still counts.
const TEXT =
  "Whenever this creature attacks, if another creature entered the battlefield under your control this turn, this creature gains flying until end of turn.";

export default defineCard({
  name: "Waterspout Warden",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Frog", "Soldier"],
  power: 3,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, excludeSelf: true },
      targets: [],
      effect: { kind: "grant-keyword", target: "source", keyword: "flying", duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
