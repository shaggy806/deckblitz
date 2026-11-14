import { defineCard } from "../define.js";

// Rulings:
//   [2021-07-23] If the spell had {X} in its mana cost, X will be whatever value it had on the
//     stack when calculating its mana value.
//   [2021-07-23] If the exiled card is an adventurer card, you may cast the Adventure spell this
//     way.
//   [2021-07-23] Gale's Redirection exiles the spell directly from the stack without countering
//     it. Because of this, it's effective against spells that can't be countered.
//
// "That spell's mana value" is read as it last was on the stack, its {X}
// included (rule 608.2h — `lastStackManaValue`). The permission is over the
// card this exiled (rule 400.7j: an effect that moves an object to a public zone
// can find it there), for as long as it stays exiled.

const TEXT =
  "Exile target spell, then roll a d20 and add that spell's mana value.\n1—14 | You may cast the exiled card for as long as it remains exiled, and you may spend mana as though it were mana of any color to cast that spell.\n15+ | You may cast the exiled card without paying its mana cost for as long as it remains exiled.";

export default defineCard({
  name: "Gale's Redirection",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: TEXT,
  targets: ["spell"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "exile", target: 0 },
      {
        kind: "roll-dice",
        sides: 20,
        modifier: { manaValueOf: 0 },
        table: [
          {
            min: 1,
            max: 14,
            effect: { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "while-exiled", spendAs: "any-color" },
          },
          {
            min: 15,
            effect: { kind: "grant-play", cards: { thisWay: "exiled" }, duration: "while-exiled", free: true },
          },
        ],
      },
    ],
  },
});
