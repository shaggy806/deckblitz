import { defineCard } from "../define.js";

// EDHREC rank 6997.
//
// Rulings:
//   [2020-04-17] An ability that triggers when a player casts a spell resolves before the spell
//     that caused it to trigger. It resolves even if that spell is countered.
//   [2020-04-17] If a card you discard has {X} in its mana cost, X is considered to be 0.
//   [2020-04-17] The emblem created by Narset's last ability is colorless. The damage it deals is
//     from a colorless source.
//   [2020-04-17] Because it's a loyalty ability, Narset's first ability isn't a mana ability. It
//     can be activated only any time you could cast a sorcery. It uses the stack and can be
//     responded to.
//   [2020-04-17] You can discard a card even if Narset leaves the battlefield before her middle
//     ability resolves. The reflexive triggered ability will still trigger if you discard a
//     nonland card.
//   [2020-04-17] Narset's second ability goes on the stack without a target. While that ability is
//     resolving, you draw a card and may choose to discard a card. When you discard a nonland card
//     this way, the reflexive triggered ability triggers and you pick a target to be dealt damage.
//     This is different from effects that say "If you do . . ." in that you choose a target after
//     looking at the card you draw and players can respond to the reflexive triggered ability
//     knowing how much damage will be dealt.

const PLUS = "+1: You gain 2 life. Add {U}, {R}, or {W}. Spend this mana only to cast a noncreature spell.";
const MINUS =
  "−2: Draw a card, then you may discard a card. When you discard a nonland card this way, Narset deals damage equal to that card's mana value to target creature or planeswalker.";
const ULTIMATE =
  '−6: You get an emblem with "Whenever you cast a noncreature spell, this emblem deals 2 damage to any target."';

export default defineCard({
  name: "Narset of the Ancient Way",
  manaCost: "{1}{U}{R}{W}",
  colors: ["W", "U", "R"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Narset"],
  loyalty: 4,
  text: `${PLUS}\n${MINUS}\n${ULTIMATE}`,
  activated: [
    {
      // A loyalty ability, not a mana ability (the fourth ruling): it uses
      // the stack, at sorcery speed. The mana is The Emperor of Palamecia's.
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "gain-life", amount: 2 },
          {
            kind: "add-mana",
            mana: { oneOf: ["U", "R", "W"] },
            amount: 1,
            spendOnly: {
              spell: { notTypes: ["creature"] },
              text: "Spend this mana only to cast a noncreature spell.",
            },
          },
        ],
      },
      resolve: null,
      text: PLUS,
    },
    {
      // No target as it's activated: draw, then the "may" discard, and only a
      // nonland card discarded fires the reflexive trigger, whose target is
      // chosen as it goes on the stack, knowing the damage (the last ruling).
      // The Ancient One's shape. It still triggers if Narset has left (the
      // fifth ruling); a discarded card's {X} is 0 (the second).
      loyaltyCost: -2,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 1 },
          {
            kind: "may",
            prompt: "Discard a card?",
            effect: {
              kind: "sequence",
              effects: [
                { kind: "discard", target: "you", amount: 1 },
                {
                  kind: "conditional",
                  condition: { kind: "this-way", what: "discarded", filter: { notTypes: ["land"] } },
                  then: {
                    kind: "reflexive-trigger",
                    targets: [{ kind: "permanent", whose: "any", filter: { typesAnyOf: ["creature", "planeswalker"] } }],
                    value: { thisWay: "discarded", sumOf: "mana-value" },
                    effect: { kind: "damage", amount: { triggerValue: true }, target: 0 },
                    text: "When you discard a nonland card this way, Narset deals damage equal to that card's mana value to target creature or planeswalker.",
                  },
                },
              ],
            },
          },
        ],
      },
      resolve: null,
      text: MINUS,
    },
    {
      // Chandra, Torch of Defiance's emblem, for noncreature spells. The
      // emblem is a colorless source (the third ruling).
      loyaltyCost: -6,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "create-emblem",
        text: "Whenever you cast a noncreature spell, this emblem deals 2 damage to any target.",
        triggered: [
          {
            trigger: { on: "cast-spell", who: "you", noncreatureOnly: true },
            targets: ["any-target"],
            effect: { kind: "damage", amount: 2, target: 0 },
            resolve: null,
            text: "Whenever you cast a noncreature spell, this emblem deals 2 damage to any target.",
          },
        ],
      },
      resolve: null,
      text: ULTIMATE,
    },
  ],
});
