import { defineCard } from "../define.js";
import { REVOLT_CONDITION } from "../helpers.js";

// EDHREC rank 19703.
// Makes Insect Warrior → new token "Insect Warrior Token" (scaffolded).
//
// Rulings:
//   [2026-01-27] Some disappear abilities, such as those of the above cards, are triggered
//     abilities with intervening if clauses. If a permanent hasn't left the battlefield under your
//     control that turn by the time the disappear ability would trigger, it won't trigger at all.
const DISAPPEAR_TEXT =
  "Disappear — At the beginning of your end step, if a permanent left the battlefield under your control this turn, create a 1/1 black Insect Warrior creature token with flying.";
const DRAW_TEXT = "{3}{G}, Sacrifice a token: Draw a card.";

export default defineCard({
  name: "Lord Dregg, Insect Invader",
  manaCost: "{3}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Insect", "Warrior"],
  power: 3,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DISAPPEAR_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: REVOLT_CONDITION,
      effect: { kind: "create-token", token: "Insect Warrior Token", count: 1 },
      resolve: null,
      text: DISAPPEAR_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{G}", tap: false, sacrifice: { filter: { token: true } } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
