import { defineCard } from "../define.js";

// EDHREC rank 18232. March of the Machine.
//
// - The granted mana ability is Katilda's "any of this creature's colors"
//   (`colorAmong` the creature itself: a colorless one makes none), with
//   Boommobile's spending rule narrowed to creatures on the battlefield (the
//   ruling: not creature cards in other zones).
// - "Activate only if this creature has another activated ability": two or
//   more activated abilities, this one among them (`hasActivatedAbility:
//   { atLeast: 2 }`) — any other counts, even one that can't be activated now
//   or on the battlefield at all, such as cycling (the ruling). A second
//   Tazri's copy of the ability is another.
// - The mill takes every milled creature card with an activated ability that
//   isn't a mana ability (cycling is one) into the hand.
//
// Rulings:
//   [2023-05-12] The other activated ability the creature must have can be any activated ability,
//     including one that can't be activated at the moment, or even one that can't be activated
//     while the creature is on the battlefield. For example, you could tap a creature with cycling
//     and Tazri's ability for mana.
//   [2023-05-12] The mana produced by the ability granted by Tazri's first ability may be spent
//     only to activate an ability of a creature on the battlefield. It can't be spent to activate
//     abilities of creature cards in other zones.

const MANA_TEXT =
  "{T}: Add one mana of any of this creature's colors. Spend this mana only to activate an ability of a creature. Activate only if this creature has another activated ability.";
const GRANT_TEXT = `Each creature you control has "${MANA_TEXT}"`;
const MILL_TEXT =
  "{W}{U}{B}{R}{G}, {T}: Mill five cards. Put all creature cards with activated abilities that aren't mana abilities from among the milled cards into your hand.";

export default defineCard({
  name: "Tazri, Stalwart Survivor",
  manaCost: "{2}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Human", "Warrior"],
  power: 3,
  toughness: 3,
  text: `${GRANT_TEXT}\n${MILL_TEXT}`,
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantsActivated: [
        {
          cost: { mana: null, tap: true },
          targets: [],
          effect: {
            kind: "add-mana",
            mana: { colorAmong: { isSource: true } },
            amount: 1,
            spendOnly: { abilityOf: { type: "creature" }, text: "Spend this mana only to activate an ability of a creature." },
          },
          condition: { kind: "source", filter: { hasActivatedAbility: { atLeast: 2 } } },
          resolve: null,
          text: MANA_TEXT,
        },
      ],
      text: GRANT_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{W}{U}{B}{R}{G}", tap: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "mill", target: "you", amount: 5 },
          {
            kind: "return-from-graveyard",
            filter: { thisWay: "milled", type: "creature", hasActivatedAbility: { mana: false } },
            destination: "hand",
            count: "all",
          },
        ],
      },
      resolve: null,
      text: MILL_TEXT,
    },
  ],
});
