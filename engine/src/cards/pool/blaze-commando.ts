import { defineCard } from "../define.js";

// EDHREC rank 20385.
//
// Rulings:
//   [2013-04-15] Blaze Commando's ability triggers each time an instant or sorcery spell you
//     control deals damage (or, put another way, the number of times the word "deals" appears in
//     its instructions), no matter how much damage is dealt or how many players or permanents are
//     dealt damage.
//   [2013-04-15] Some instant or sorcery spells cause other objects to deal damage, rather than
//     deal damage themselves. Such spells don't cause Blaze Commando to trigger.
//
// Satyr Firedancer's trigger with no recipient named: `deals-damage` then fires once per
// simultaneous damage event, however many things were dealt damage — the ruling's count.

const TEXT =
  "Whenever an instant or sorcery spell you control deals damage, create two 1/1 red and white Soldier creature tokens with haste.";

export default defineCard({
  name: "Blaze Commando",
  manaCost: "{3}{R}{W}",
  colors: ["W", "R"],
  types: ["creature"],
  subtypes: ["Minotaur", "Soldier"],
  power: 5,
  toughness: 3,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "deals-damage", who: "you-control", filter: { typesAnyOf: ["instant", "sorcery"] } },
      targets: [],
      effect: { kind: "create-token", token: "Red-White Soldier Token", count: 2 },
      resolve: null,
      text: TEXT,
    },
  ],
});
