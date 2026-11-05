import { defineCard } from "../define.js";

// Omen Machine's forced cast (`mustCast`), from a card revealed at random from
// the upkeep player's hand: cast if able, timing ignored; a card that can't be
// cast (no legal target, a play restriction) stays in the hand (its rulings).
const TEXT =
  "At the beginning of each player's upkeep, that player reveals a card at random from their hand. If it's a land card, the player puts it onto the battlefield. Otherwise, the player casts it without paying its mana cost if able.";

export default defineCard({
  name: "Wild Evocation",
  manaCost: "{5}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "upkeep", who: "any" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "active-player",
        effect: {
          kind: "choose-random-card",
          zone: "hand",
          whose: "that-player",
          show: "reveal",
          then: {
            kind: "conditional",
            condition: { kind: "target", index: 0, filter: { type: "land" } },
            then: { kind: "put-onto-battlefield", target: 0 },
            else: { kind: "cast-now", target: 0, by: "that-player", free: true, mustCast: true },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
