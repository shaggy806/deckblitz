import { defineCard } from "../define.js";

// EDHREC rank 11405.
//
// Rulings:
//   [2024-07-26] You cast the instant or sorcery while the ability is resolving and still on the
//     stack. You can’t wait to cast it later in the turn. Timing restrictions based on the card’s
//     type are ignored.
//   [2024-07-26] If the spell you cast has {X} in its mana cost, you must choose 0 as the value of
//     X when casting it without paying its mana cost.
//   [2024-07-26] Since you are using an alternative cost to cast the spell, you can’t pay any
//     other alternative costs. You can, however, pay additional costs, such as kicker costs. If
//     the card has any mandatory additional costs, you must pay those.
//
// "When you do" is a reflexive trigger (rule 603.12) that follows only a coin
// counter actually put on the Well — not one that has left the battlefield in
// response (Lockjaw, Slobbering Teleporter's shape). It's the reflexive
// ability that targets, once the counter is on, so "mana value equal to the
// number of coin counters" counts the new one; the cast is The Dawning
// Archaic's free `cast-now` with its exile-instead rider.

const TEXT =
  "{T}: Put a coin counter on this artifact. When you do, you may cast target instant or sorcery card with mana value equal to the number of coin counters on this artifact from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead. Activate only as a sorcery.";
const WHEN_YOU_DO =
  "You may cast target instant or sorcery card with mana value equal to the number of coin counters on this artifact from your graveyard without paying its mana cost. If that spell would be put into your graveyard, exile it instead.";

export default defineCard({
  name: "Wishing Well",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["artifact"],
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: {
        kind: "conditional",
        condition: { kind: "source-on-battlefield" },
        then: {
          kind: "sequence",
          effects: [
            { kind: "add-counter", target: "source", counter: "coin", amount: 1 },
            {
              kind: "reflexive-trigger",
              targets: [
                {
                  kind: "card-in-graveyard",
                  whose: "you",
                  filter: {
                    typesAnyOf: ["instant", "sorcery"],
                    manaValue: { op: "eq", n: { amount: { countersOn: "source", counter: "coin" } } },
                  },
                },
              ],
              effect: { kind: "cast-now", target: 0, free: true, exileAfter: true },
              text: WHEN_YOU_DO,
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
      sorcerySpeed: true,
    },
  ],
});
