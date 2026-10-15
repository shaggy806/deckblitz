import { defineCard } from "../define.js";

// EDHREC rank 19479.
//
// An intervening "if" (rule 603.4): checked as the end step begins — with no
// other creature having entered under your control it doesn't trigger at all,
// so one entering during the end step is too late (the ruling) — and again as
// it resolves. "Another" is Éowyn, Shieldmaiden's `excludeSelf`.

const END_TEXT =
  "At the beginning of your end step, if another creature entered the battlefield under your control this turn, surveil 1.";

export default defineCard({
  name: "Wary Farmer",
  manaCost: "{1}{G/W}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Kithkin", "Citizen"],
  power: 3,
  toughness: 3,
  text: `${END_TEXT} (Look at the top card of your library. You may put it into your graveyard.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "creature" }, excludeSelf: true },
      targets: [],
      effect: { kind: "surveil", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
