import { defineCard } from "../define.js";

// EDHREC rank 16160.
//
// Rulings:
//   [2025-11-17] Changeling is a characteristic-defining ability. It functions in all zones, not
//     only while a card that has it is on the battlefield.
//   [2025-11-17] You pay all costs and follow all timing rules for cards played this way. For
//     example, if the exiled card is a land card, you may play it only during your main phase
//     while the stack is empty.
//   [2025-11-17] The subtype Shapeshifter that appears on the type line is mostly there to
//     reinforce the flavor. A creature card with changeling is just as much a Kithkin, a Goblin, a
//     Merfolk, and a Brushwagg as it is a Shapeshifter.
//   [2025-11-17] If an effect causes a creature with changeling to become a new creature type, it
//     will be only that new creature type (unless the effect says "in addition" or similar). It
//     will still have changeling; the effect making it all creature types will simply be
//     overwritten.
//   [2025-11-17] If an effect causes a creature with changeling to lose all abilities, it will
//     remain all creature types, even though it will no longer have changeling. This is because
//     changeling applies before the effect that removes it.

const DIES_TEXT =
  "When this creature dies, exile the top card of your library. Until the end of your next turn, you may play that card.";

export default defineCard({
  name: "Sizzling Changeling",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Shapeshifter"],
  power: 3,
  toughness: 2,
  keywords: ["changeling"],
  text: `Changeling (This card is every creature type.)\n${DIES_TEXT}`,
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "impulse-exile", amount: 1, duration: "your-next-turn" },
      resolve: null,
      text: DIES_TEXT,
    },
  ],
});
