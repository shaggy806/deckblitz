import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// The Lord of the Rings: Tales of Middle-earth (LTR). EDHREC rank 11805.
//
// Ward's discard takes `discardOf`: only an enchantment, instant or sorcery
// card pays it, so with none in hand it can't be paid (the third ruling). The
// second-spell trigger mills each opponent two, and only if a card was milled
// does the reflexive ability trigger (rule 603.12), its target chosen then:
// any opponent's enchantment, instant or sorcery card whose mana value is at
// most that spell's — read as the reflexive ability triggers (`value`), the
// spell as it last existed if it has left the stack. The exiled card is
// copied and the copy may be cast free while the ability resolves (rule
// 707.12); an enchantment's copy becomes a token as it resolves.
//
// Rulings:
//   - You don't choose a target for Saruman of Many Colors's ability at the time it triggers.
//     Rather, a second "reflexive" ability triggers when one or more cards are milled this way.
//     You choose a target for that ability as it goes on the stack. Each player may respond to
//     this triggered ability as normal.
//   - If the spell you cast has {X} in its mana cost, you must choose 0 as the value of X when
//     casting it without paying its mana cost.
//   - If you don't have an enchantment, instant, or sorcery card in your hand, you won't be able
//     to pay Saruman of Many Colors's ward cost.
//   - If you cast a spell "without paying its mana cost," you can't pay any alternative costs.
//     You can, however, pay additional costs, such as kicker costs. If the card has any mandatory
//     additional costs, you must pay those.
//   - If you don't want to cast the copy, you can choose not to; the copy ceases to exist the next
//     time state-based actions are checked.
//   - You cast the copy while the ability is resolving and still on the stack. You can't wait to
//     cast it later in the turn.

const TYPES = { typesAnyOf: ["enchantment", "instant", "sorcery"] } as const;
const REFLEXIVE_TEXT =
  "When one or more cards are milled this way, exile target enchantment, instant, or sorcery card with equal or lesser mana value than that spell from an opponent's graveyard. Copy the exiled card. You may cast the copy without paying its mana cost.";
const TRIGGER_TEXT = `Whenever you cast your second spell each turn, each opponent mills two cards. ${REFLEXIVE_TEXT}`;

export default defineCard({
  name: "Saruman of Many Colors",
  manaCost: "{3}{W}{U}{B}",
  colors: ["W", "U", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Avatar", "Wizard"],
  power: 5,
  toughness: 4,
  text: `Ward—Discard an enchantment, instant, or sorcery card.\n${TRIGGER_TEXT}`,
  triggered: [
    ward({ discard: 1, discardOf: { filter: TYPES, what: "an enchantment, instant, or sorcery card" } }),
    {
      trigger: { on: "cast-spell", who: "you", nthEachTurn: 2 },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "each-opponent", amount: 2 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "milled", atLeast: 1 },
            then: {
              kind: "reflexive-trigger",
              value: { manaValueOf: "trigger-object" },
              targets: [
                {
                  kind: "card-in-graveyard",
                  whose: "opponent",
                  filter: { ...TYPES, manaValue: { op: "lte", n: { amount: { triggerValue: true } } } },
                },
              ],
              effect: {
                kind: "sequence",
                effects: [
                  { kind: "exile", target: 0 },
                  { kind: "cast-now", from: "exiled-this-way", copies: 1, free: true },
                ],
              },
              text: REFLEXIVE_TEXT,
            },
          },
        ],
      },
      resolve: null,
      text: TRIGGER_TEXT,
    },
  ],
});
