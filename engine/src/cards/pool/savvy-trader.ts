import { defineCard } from "../define.js";

// EDHREC rank 4570. The exiled card may be *played* (a land too) for as long
// as it remains exiled, by the player who controlled the ability — whoever
// controls Savvy Trader later, and whether or not it's still around (the
// rulings): `exile`'s `mayCast` with `play`.
//
// Rulings:
//   You may play the card exiled with Savvy Trader's first ability even if Savvy Trader leaves the
//     battlefield. If another player gains control of Savvy Trader, that player can't play the card,
//     and you still can.
//   You pay all costs and follow all normal timing rules for the card played from exile.
//   Savvy Trader's last ability can't reduce the amount of colored mana you pay for a spell.

const ENTERS_TEXT =
  "When this creature enters, exile target permanent card from your graveyard. You may play that card for as long as it remains exiled.";
const REDUCE_TEXT = "Spells you cast from anywhere other than your hand cost {1} less to cast.";

export default defineCard({
  name: "Savvy Trader",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Citizen"],
  power: 3,
  toughness: 3,
  text: `${ENTERS_TEXT}\n${REDUCE_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "card-in-graveyard",
          whose: "you",
          filter: { typesAnyOf: ["artifact", "battle", "creature", "enchantment", "land", "planeswalker"] },
        },
      ],
      effect: { kind: "exile", target: 0, mayCast: { duration: "while-exiled", play: true } },
      resolve: null,
      text: ENTERS_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "self" },
      costModification: { applies: {}, caster: "you", notFromCastersHand: true, reduceGeneric: 1 },
      text: REDUCE_TEXT,
    },
  ],
});
