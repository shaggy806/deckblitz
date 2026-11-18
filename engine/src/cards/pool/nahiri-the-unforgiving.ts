import { defineCard } from "../define.js";

// EDHREC rank 17044.
//
// Rulings:
//   [2023-02-04] The compleated ability looks only at whether a player chose to pay 2 life for a
//     Phyrexian mana symbol as they were casting the spell.
//   [2023-02-04] The last loyalty ability will check Nahiri's loyalty as the ability tries to
//     resolve to see if the target is still legal. If it's not, the ability won't resolve and
//     none of its effects will happen. The card won't be exiled and no token will be created.
//   [2023-02-04] A hybrid Phyrexian mana symbol contributes 1 toward the mana value of a card,
//     even if life is paid for it. Specifically, Nahiri's mana value is always 4.
//   [2023-02-04] If the creature targeted by the first loyalty ability can't attack for any
//     reason (such as being tapped), then it doesn't attack. If there's a cost associated with
//     having it attack, its controller isn't forced to pay that cost.
//
// "Attacks a player each combat if able" is a requirement obeyed only by
// attacking a player (rule 508.1d): `must-attack` aimed at `{ defender: {} }`,
// every player and never a planeswalker or battle. The 0's target compares
// with her loyalty counters (rule 306.5b), read again as it resolves.
const PLUS_ATTACK_TEXT = "+1: Until your next turn, up to one target creature attacks a player each combat if able.";
const PLUS_LOOT_TEXT = "+1: Discard a card, then draw a card.";
const ZERO_TEXT =
  "0: Exile target creature or Equipment card with mana value less than Nahiri's loyalty from your graveyard. Create a token that's a copy of it. That token gains haste. Exile it at the beginning of the next end step.";

export default defineCard({
  name: "Nahiri, the Unforgiving",
  manaCost: "{1}{R}{R/W/P}{W}",
  colors: ["R", "W"],
  supertypes: ["legendary"],
  types: ["planeswalker"],
  subtypes: ["Nahiri"],
  loyalty: 5,
  compleated: true,
  text: `Compleated ({R/W/P} can be paid with {R}, {W}, or 2 life. If life was paid, this planeswalker enters with two fewer loyalty counters.)\n${PLUS_ATTACK_TEXT}\n${PLUS_LOOT_TEXT}\n${ZERO_TEXT}`,
  activated: [
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [{ kind: "optional", of: "creature" }],
      effect: {
        kind: "restrict",
        target: 0,
        restrictions: [{ kind: "must-attack", at: { defender: {} } }],
        duration: "until-your-next-turn",
      },
      resolve: null,
      text: PLUS_ATTACK_TEXT,
    },
    {
      loyaltyCost: 1,
      cost: { mana: null, tap: false },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          { kind: "draw", amount: 1 },
        ],
      },
      resolve: null,
      text: PLUS_LOOT_TEXT,
    },
    {
      loyaltyCost: 0,
      cost: { mana: null, tap: false },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: {
            anyOf: [{ type: "creature" }, { subtype: "Equipment" }],
            manaValue: { op: "lt", n: { amount: { countersOn: "source", counter: "loyalty" } } },
          },
        },
      ],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "exile", target: 0 },
          {
            kind: "conditional",
            condition: { kind: "this-way", what: "exiled" },
            then: {
              kind: "create-token-copy",
              of: 0,
              count: 1,
              who: "you",
              asCard: true,
              gains: { keywords: ["haste"] },
              exileAtEndStep: true,
            },
          },
        ],
      },
      resolve: null,
      text: ZERO_TEXT,
    },
  ],
});
