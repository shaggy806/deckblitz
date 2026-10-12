import { defineCard } from "../define.js";

// EDHREC rank 9637.
// Makes Pest → "Pest Token (Attacks)" (the attack-lifegain Pest; tokens/pest-token-attacks.ts).
//
// Rulings:
//   [2026-03-20] Essenceknit Scholar's last ability will check as your end step starts to see if a
//     creature died under your control this turn. If none did, the ability won't trigger at all.
//     It's not possible to cause a creature to die during your end step in time to have the
//     ability trigger.

const PEST_TEXT =
  'When this creature enters, create a 1/1 black and green Pest creature token with "Whenever this token attacks, you gain 1 life."';
const DRAW_TEXT = "At the beginning of your end step, if a creature died under your control this turn, draw a card.";

// The draw is an intervening-if (rule 603.4): checked as the end step begins
// and again on resolution — the turn's record of creatures that died under
// your control (`turn-history`), which only grows during the turn.
export default defineCard({
  name: "Essenceknit Scholar",
  manaCost: "{B}{B/G}{G}",
  colors: ["B", "G"],
  types: ["creature"],
  subtypes: ["Dryad", "Warlock"],
  power: 3,
  toughness: 1,
  text: `${PEST_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Pest Token (Attacks)", count: 1 },
      resolve: null,
      text: PEST_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "died", who: "you", filter: { type: "creature" } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
