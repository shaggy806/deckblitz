import { defineCard } from "../define.js";

// EDHREC rank 21983.
//
// Rulings:
//   [2025-10-02] The triggered ability can trigger only once each turn. It doesn't matter whether
//     Wolfbat was in your graveyard when the first card was drawn. If it's not in your graveyard
//     when the second card is drawn, the ability can't trigger at all that turn.
//
// Nether Traitor's "you may pay {B}. If you do, return this card from your
// graveyard to the battlefield", on the second draw; the finality counter is
// Admiral Brass's (`moveObject` reads it).

const DRAW_TEXT =
  "Whenever you draw your second card each turn, you may pay {B}. If you do, return this card from your graveyard to the battlefield with a finality counter on it.";

export default defineCard({
  name: "Wolfbat",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Wolf", "Bat"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${DRAW_TEXT} (If a creature with a finality counter on it would die, exile it instead.)`,
  triggered: [
    {
      fromGraveyard: true,
      trigger: { on: "draws", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {B} to return Wolfbat to the battlefield?",
        cost: "{B}",
        effect: { kind: "put-onto-battlefield", target: "source", withCounters: { kind: "finality", amount: 1 } },
      },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
