import { defineCard } from "../define.js";

// SCAFFOLD — written by `npm run card:scaffold` from the Oracle snapshot. Not in the
// registry: author each TODO(scaffold), move this file into cards/pool/ (or
// tokens/), then run `npm run gen:cards -w engine`. See cards/AUTHORING.md.
// EDHREC rank 22418.
//
// Rulings:
//   [2014-02-01] If no creature is blocking or being blocked by Vortex Elemental as its first
//     ability resolves, it alone will be put on top of its owner’s library, and that library will
//     be shuffled. You can activate the first ability outside of combat.
//   [2014-02-01] If Vortex Elemental isn’t on the battlefield when its first ability resolves, any
//     creatures blocking or blocked by it when it left the battlefield will be put on top of their
//     owners’ libraries and those libraries will be shuffled.
//   [2014-02-01] The creature blocks Vortex Elemental only if it’s able to do so as the declare
//     blockers step begins. If, at that time, the creature is tapped, it’s affected by a spell or
//     ability that says it can’t block, or Vortex Elemental isn’t attacking its controller or a
//     planeswalker controlled by that player, then it doesn’t block. If there’s a cost associated
//     with having the creature block, the player isn’t forced to pay that cost. If that cost isn’t
//     paid, the creature won’t block.

export default defineCard({
  name: "Vortex Elemental",
  manaCost: "{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Elemental"],
  power: 0,
  toughness: 1,
  text: "{U}: Put this creature and each creature blocking or blocked by it on top of their owners' libraries, then those players shuffle.\n{3}{U}{U}: Target creature blocks this creature this turn if able.",
  activated: [
    {
      cost: { mana: "{U}", tap: false },
      targets: [],
      effect: null,
      resolve: null,
      text: "{U}: Put this creature and each creature blocking or blocked by it on top of their owners' libraries, then those players shuffle.",
      // TODO(scaffold): Put ~ and each creature blocking or blocked by it on top of their owners' libraries, then those players shuffle.
    },
    {
      cost: { mana: "{3}{U}{U}", tap: false },
      targets: [],
      effect: null,
      resolve: null,
      text: "{3}{U}{U}: Target creature blocks this creature this turn if able.",
      // TODO(scaffold): Target creature blocks ~ this turn if able.
    },
  ],
});
