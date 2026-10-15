import { defineCard } from "../define.js";

// EDHREC rank 14380.
//
// Rulings:
//   [2025-11-17] If an effect causes a creature with changeling to lose all abilities, it will
//     remain all creature types, even though it will no longer have changeling. This is because
//     changeling applies before the effect that removes it.
//   [2025-11-17] If an effect causes a creature with changeling to become a new creature type, it
//     will be only that new creature type (unless the effect says "in addition" or similar). It
//     will still have changeling; the effect making it all creature types will simply be
//     overwritten.
//   [2025-11-17] Changeling is a characteristic-defining ability. It functions in all zones, not
//     only while a card that has it is on the battlefield.
//   [2025-11-17] The subtype Shapeshifter that appears on the type line is mostly there to
//     reinforce the flavor. A creature card with changeling is just as much a Kithkin, a Goblin, a
//     Merfolk, and a Brushwagg as it is a Shapeshifter.
//   [2025-11-17] You don't have to choose any targets for Rooftop Percher's triggered ability.
//     However, if you do and all of the targets are illegal as the ability tries to resolve, it
//     won't resolve and none of its effects will happen. You won't gain life.

// Skullsnatcher's "up to two target cards", over every graveyard, then the
// life. Zero targets chosen still gains the life; targets chosen and all
// illegal on resolution, nothing happens (the ruling — rule 608.2b).
const ENTER_TEXT = "When this creature enters, exile up to two target cards from graveyards. You gain 3 life.";

export default defineCard({
  name: "Rooftop Percher",
  manaCost: "{5}",
  colors: [],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 3,
  keywords: ["changeling", "flying"],
  text: `Changeling (This card is every creature type.)\nFlying\n${ENTER_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [{ kind: "any-number", of: { kind: "card-in-graveyard", whose: "any" }, max: 2 }],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "for-each-target", from: 0, effect: { kind: "exile", target: 0 }, simultaneous: true },
          { kind: "gain-life", amount: 3 },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
