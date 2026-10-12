import { defineCard } from "../define.js";

// EDHREC rank 11115.
//
// Rulings:
//   [2026-03-20] Primary Research's last ability will check as your end step starts to see if any
//     cards have left your graveyard this turn. If none did, the ability won't trigger at all.
//     It's not possible to remove cards from your graveyard during your end step in time to have
//     the ability trigger.
//   [2026-03-20] If a card in a graveyard has {X} in its mana cost, X is 0 for the purpose of
//     determining its mana value.
const RETURN_TEXT =
  "When this enchantment enters, return target nonland permanent card with mana value 3 or less from your graveyard to the battlefield.";
const DRAW_TEXT = "At the beginning of your end step, if a card left your graveyard this turn, draw a card.";

export default defineCard({
  name: "Primary Research",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["enchantment"],
  text: `${RETURN_TEXT}\n${DRAW_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            typesAnyOf: ["artifact", "creature", "enchantment", "planeswalker", "battle"],
            manaValue: { op: "lte", n: 3 },
          },
        },
      ],
      effect: { kind: "put-onto-battlefield", target: 0 },
      resolve: null,
      text: RETURN_TEXT,
    },
    {
      // An intervening-if (rule 603.4): checked as the step begins and again
      // as it resolves.
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "cards-left-graveyard", who: "you", atLeast: 1 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: DRAW_TEXT,
    },
  ],
});
