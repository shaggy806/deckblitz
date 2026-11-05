import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

const LOOT = "{2}{U}, {T}: Draw two cards, then discard a card.";
const REVEAL =
  "Whenever Atemsis deals damage to an opponent, you may reveal your hand. If cards with at least six different mana values are revealed this way, that player loses the game.";

// The different mana values in your hand: one for each value at least one card
// has. No Commander-legal card's mana value is above 16 (Draco). A card with
// {X} counts it as 0 and a split card its two halves together (the rulings),
// as `manaValue` reads them.
const DIFFERENT_MANA_VALUES: EffectAmount = {
  sum: Array.from({ length: 21 }, (_, n): EffectAmount => ({
    ifCondition: { kind: "hand-size", atLeast: 1, filter: { manaValue: { op: "eq", n } } },
    then: 1,
    else: 0,
  })),
};

export default defineCard({
  name: "Atemsis, All-Seeing",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sphinx"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: `Flying\n${LOOT}\n${REVEAL}`,
  activated: [
    {
      cost: { mana: "{2}{U}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 2 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: LOOT,
    },
  ],
  triggered: [
    {
      trigger: { on: "deals-damage", who: "self", to: "opponent" },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Reveal your hand?",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "reveal-hand", who: "you" },
            {
              kind: "conditional",
              condition: { kind: "amounts", left: DIFFERENT_MANA_VALUES, op: "gte", right: 6 },
              then: { kind: "lose-game", who: "trigger-player" },
            },
          ],
        },
      },
      resolve: null,
      text: REVEAL,
    },
  ],
});
