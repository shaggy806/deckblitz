import type { EffectAmount } from "../../effects.js";
import { defineCard } from "../define.js";

// Rulings:
//   Each opponent in turn order chooses a card to discard without revealing it, then all the
//   chosen cards are discarded simultaneously.
//   If there are multiple cards tied for the highest mana value, each player who discarded one of
//   those cards will lose life equal to that mana value.
//
// - The discard's greatest mana value is an amount a filter can compare with: a
//   `this-way` condition, for each player, on what they discarded.
const TEXT =
  "Whenever this creature deals combat damage to a player, each opponent discards a card. Each player who discarded " +
  "a card with the greatest mana value among cards discarded this way loses life equal to that mana value.";

const GREATEST: EffectAmount = { aggregate: "max", of: "mana-value", filter: {}, in: { thisWay: "discarded" } };

export default defineCard({
  name: "Scythe Specter",
  manaCost: "{4}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Specter"],
  power: 4,
  toughness: 4,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "deals-combat-damage-to-player", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "each-opponent", amount: 1 },
          {
            kind: "for-each-player",
            who: "each-player",
            effect: {
              kind: "conditional",
              condition: {
                kind: "this-way",
                what: "discarded",
                who: "that-player",
                filter: { manaValue: { op: "eq", n: { amount: GREATEST } } },
              },
              then: { kind: "lose-life", amount: GREATEST, who: "that-player" },
            },
          },
        ],
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
