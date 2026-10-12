import { defineCard } from "../define.js";

// EDHREC rank 7868.
//
// Rulings:
//   [2025-11-17] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of
//     X when casting it without paying its mana cost.
//   [2025-11-17] Bre's last ability will check as your end step starts to see if you gained life
//     this turn. If you didn't, the ability won't trigger at all. Gaining life during your end
//     step won't cause the ability to trigger.
//   [2025-11-17] If you choose to cast the exiled card, you do so while Bre's last ability is
//     resolving and still on the stack. You can't wait to cast it later in the turn. Timing
//     restrictions based on the card's type are ignored.
//   [2025-11-17] Since you are using an alternative cost to cast the spell, you can't pay any
//     other alternative costs. You can, however, pay additional costs, such as kicker costs. If
//     the card has any mandatory additional costs, you must pay those.
//
// The end-step trigger is Enlightened Confidant's intervening "if" over
// Breaching Dragonstorm's exile-until and free cast: the mana-value cap is
// read as the cast is offered (the spell judged at X = 0, rule 107.3b), and
// a card not cast — declined, or too big — goes to its owner's hand from
// exile. The lands exiled on the way stay exiled.
const GRANT_TEXT = "{1}{W}, {T}: Another target creature you control gains flying and lifelink until end of turn.";
const END_TEXT =
  "At the beginning of your end step, if you gained life this turn, exile cards from the top of your library until you exile a nonland card. You may cast that card without paying its mana cost if the spell's mana value is less than or equal to the amount of life you gained this turn. Otherwise, put it into your hand.";

export default defineCard({
  name: "Bre of Clan Stoutarm",
  manaCost: "{2}{R}{W}",
  colors: ["W", "R"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Giant", "Warrior"],
  power: 4,
  toughness: 4,
  text: `${GRANT_TEXT}\n${END_TEXT}`,
  activated: [
    {
      cost: { mana: "{1}{W}", tap: true },
      targets: [{ kind: "other", of: "creature-you-control" }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "grant-keyword", target: 0, keyword: "flying", duration: "end-of-turn" },
          { kind: "grant-keyword", target: 0, keyword: "lifelink", duration: "end-of-turn" },
        ],
      },
      resolve: null,
      text: GRANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-stat", stat: "life-gained", who: "you", atLeast: 1 },
      targets: [],
      effect: {
        kind: "reveal-until",
        filter: { notTypes: ["land"] },
        exile: true,
        rest: "stay",
        then: {
          kind: "cast-now",
          target: 0,
          free: true,
          spell: { manaValue: { op: "lte", n: { amount: { turnStat: "life-gained", who: "you" } } } },
          else: { kind: "return-to-hand", target: 0, from: "exile" },
        },
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
});
