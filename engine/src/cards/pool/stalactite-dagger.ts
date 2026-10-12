import { defineCard } from "../define.js";
import { EVERY_CREATURE_TYPE } from "../../subtypes.js";

// EDHREC rank 9328.
//
// Rulings:
//   [2025-11-17] If an effect causes a creature with changeling to become a new creature type, it
//     will be only that new creature type (unless the effect says "in addition" or similar). It
//     will still have changeling; the effect making it all creature types will simply be
//     overwritten.
//   [2025-11-17] The subtype Shapeshifter that appears on the type line is mostly there to
//     reinforce the flavor. A creature card with changeling is just as much a Kithkin, a Goblin, a
//     Merfolk, and a Brushwagg as it is a Shapeshifter.
//   [2025-11-17] If an effect causes a creature with changeling to lose all abilities, it will
//     remain all creature types, even though it will no longer have changeling. This is because
//     changeling applies before the effect that removes it.
//   [2025-11-17] Changeling is a characteristic-defining ability. It functions in all zones, not
//     only while a card that has it is on the battlefield.

export default defineCard({
  name: "Stalactite Dagger",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  subtypes: ["Equipment"],
  text: "When this Equipment enters, create a 1/1 colorless Shapeshifter creature token with changeling. (It's every creature type.)\nEquipped creature gets +1/+1 and is all creature types.\nEquip {2} ({2}: Attach to target creature you control. Equip only as a sorcery.)",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: ["creature-you-control"],
      effect: { kind: "attach", target: 0 },
      resolve: null,
      text: "Equip {2}",
      sorcerySpeed: true,
    },
  ],
  // Layer 4 adds the every-creature-type marker to the equipped creature
  // (Undercover Skrull's shape), layer 7c the +1/+1.
  static: [
    {
      affects: { scope: "attached" },
      grantPt: [1, 1],
      addSubtypes: [EVERY_CREATURE_TYPE],
      text: "Equipped creature gets +1/+1 and is all creature types.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Shapeshifter Token", count: 1 },
      resolve: null,
      text: "When this Equipment enters, create a 1/1 colorless Shapeshifter creature token with changeling.",
    },
  ],
});
