import type { EffectSpec } from "../../effects.js";
import { defineCard } from "../define.js";

// EDHREC rank 8442. Marvel's Spider-Man. Keen Duelist's "you and target
// opponent each reveal …" done by the first target player (`as-player`: its
// "you" is them), with the second as the `youAnd` player — two target players,
// either of whom may be you. With the first no longer a legal target (rule
// 608.2b), only the second reveals: they lose nothing (the other player
// revealed no card) and put theirs into their hand.
const TEXT =
  "At the beginning of your end step, two target players each reveal the top card of their library. They each lose life equal to the mana value of the card revealed by the other player. Then they each put the card they revealed into their hand.";

const topCardToHand: EffectSpec = {
  kind: "look-and-choose",
  zone: "library",
  player: "that-player",
  count: 1,
  min: 1,
  max: 1,
  destination: "hand",
  leftover: "stay",
};

export default defineCard({
  name: "Parker Luck",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: ["player", { kind: "other", of: "player", than: { slots: [0] } }],
      effect: {
        kind: "conditional",
        condition: { kind: "target-legal", index: 0 },
        then: {
          kind: "as-player",
          who: { target: 0 },
          effect: {
            kind: "reveal-top",
            who: { youAnd: { target: 1 } },
            then: {
              kind: "sequence",
              effects: [
                {
                  kind: "lose-life",
                  who: { youAnd: { target: 1 } },
                  amount: { aggregate: "sum", of: "mana-value", filter: {}, in: { thisWay: "revealed", who: "each-other" } },
                },
                { kind: "for-each-player", who: { youAnd: { target: 1 } }, effect: topCardToHand },
              ],
            },
          },
        },
        else: {
          kind: "as-player",
          who: { target: 1 },
          effect: {
            kind: "reveal-top",
            then: { kind: "for-each-player", who: "you", effect: topCardToHand },
          },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
