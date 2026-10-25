import { defineCard } from "../define.js";

// Homelands (HML). EDHREC rank 30473.
//
// Rulings:
//   [2013-04-15] An ability that triggers when something "attacks and isn't blocked" triggers in
//     the declare blockers step after blockers are declared if (1) that creature is attacking and
//     (2) no creatures are declared to block it. It will trigger even if that creature was put
//     onto the battlefield attacking rather than having been declared as an attacker in the
//     declare attackers step.
//
// "If you do" holds only once a card was actually exiled: declining the `may`, or choosing no
// targets, keeps the Badger's combat damage.

const TEXT =
  "Whenever this creature attacks and isn't blocked, you may exile up to two target creature cards from defending player's graveyard. If you do, you gain 1 life for each card exiled this way and this creature assigns no combat damage this turn.";

export default defineCard({
  name: "Rysorian Badger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Badger"],
  power: 2,
  toughness: 2,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks-unblocked", who: "self" },
      targets: [
        {
          kind: "any-number",
          of: { kind: "card-in-graveyard", whose: "defending-player", filter: { type: "creature" } },
          max: 2,
        },
      ],
      effect: {
        kind: "may",
        prompt: "Exile the targeted creature cards? You gain 1 life for each, and Rysorian Badger assigns no combat damage.",
        effect: {
          kind: "sequence",
          effects: [
            { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
            {
              kind: "conditional",
              condition: { kind: "this-way", what: "exiled", atLeast: 1 },
              then: {
                kind: "sequence",
                effects: [
                  { kind: "gain-life", amount: { thisWay: "exiled" } },
                  { kind: "assigns-no-combat-damage", target: "source" },
                ],
              },
            },
          ],
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
