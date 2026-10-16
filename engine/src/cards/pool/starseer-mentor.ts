import { defineCard } from "../define.js";

// EDHREC rank 11210.
//
// Rulings:
//   [2024-07-26] While resolving Starseer Mentor’s last ability, the target opponent chooses a
//     card to be discarded without revealing it, chooses a nonland permanent to be sacrificed, or
//     chooses to do neither. Then that player discards that card, sacrifices that permanent, or
//     loses 3 life. That player can always choose to lose 3 life, even if they have cards to
//     discard or nonland permanents to sacrifice.
//   [2024-07-26] Starseer Mentor’s ability cares whether you gained or lost life this turn, not
//     how your life total changed. For example, if you gained 2 life and lost 2 life in the same
//     turn, you still gained and lost life that turn, even though your life total is the same as
//     it was at the start of the turn.
//
// The punisher is Tergrid's Lantern's `unless`, the target opponent choosing;
// "if you gained or lost life this turn" an `any` of the two turn stats.

const TEXT =
  "At the beginning of your end step, if you gained or lost life this turn, target opponent loses 3 life unless they sacrifice a nonland permanent of their choice or discard a card.";

export default defineCard({
  name: "Starseer Mentor",
  manaCost: "{3}{W}{B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Bat", "Warlock"],
  power: 3,
  toughness: 5,
  keywords: ["flying", "vigilance"],
  text: `Flying, vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: {
        kind: "any",
        of: [
          { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
          { kind: "turn-stat", stat: "life-lost", who: "you", atLeast: 1 },
        ],
      },
      targets: ["opponent"],
      effect: {
        kind: "unless",
        chooser: 0,
        options: [
          { sacrifice: { notTypes: ["land"] }, text: "Sacrifice a nonland permanent" },
          { discard: 1, text: "Discard a card" },
        ],
        otherwise: { kind: "lose-life", amount: 3, target: 0 },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
