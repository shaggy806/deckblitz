import { defineCard } from "../define.js";

// EDHREC rank 11393.
//
// Rulings:
//   [2025-10-02] If Earth Kingdom Jailer leaves the battlefield before its triggered ability
//     resolves, the target artifact, creature, or enchantment won't be exiled.
//   [2025-10-02] Auras attached to the exiled permanent will be put into their owners' graveyards.
//     Any Equipment will become unattached and remain on the battlefield. Any counters on the
//     exiled permanent will cease to exist. When the card returns to the battlefield, it will be a
//     new object with no connection to the card that was exiled.
//
// Touch the Spirit Realm's shape: `untilSourceLeaves` exiles nothing once the
// Jailer has gone (rule 610.3a), and the return is its own trigger.

const EXILE_TEXT =
  "When this creature enters, exile up to one target artifact, creature, or enchantment an opponent controls with mana value 3 or greater until this creature leaves the battlefield.";

export default defineCard({
  name: "Earth Kingdom Jailer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier", "Ally"],
  power: 3,
  toughness: 3,
  text: EXILE_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [
        {
          kind: "optional",
          of: {
            kind: "permanent",
            whose: "opponent",
            filter: { typesAnyOf: ["artifact", "creature", "enchantment"], manaValue: { op: "gte", n: 3 } },
          },
        },
      ],
      effect: { kind: "exile", target: 0, untilSourceLeaves: true },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
