import { defineCard } from "../define.js";

// EDHREC rank 25097. Coldsnap.
//
// Rulings:
//   The targeted creature that's removed from combat may then block the attacking creature that it
//     was originally blocking. If so, that creature will no longer be unblocked.
//   The attacking creature will become unblocked only if the targeted creature was the only one
//     that blocked it this combat, even if the others are gone or no longer blocking it.
//   If the targeted creature has a "When this creature blocks" ability, it triggers when it blocks
//     again; "becomes blocked" triggers only for an attacker that was unblocked at that point.
//
// False Orders' `remove-from-combat` with `unblockSoleBlocked`; "then it blocks an attacking
// creature of your choice" is mandatory, `thenMustBlock`.

const TEXT =
  "{T}: Remove target blocking creature from combat. Creatures it was blocking that hadn't become blocked by another creature this combat become unblocked, then it blocks an attacking creature of your choice. Activate only during the declare blockers step.";

export default defineCard({
  name: "Balduvian Warlord",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Barbarian"],
  power: 3,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [{ kind: "permanent", filter: { type: "creature", blocking: true } }],
      effect: { kind: "remove-from-combat", target: 0, unblockSoleBlocked: true, thenMustBlock: true },
      condition: { kind: "turn-structure", steps: ["declare-blockers"] },
      resolve: null,
      text: TEXT,
    },
  ],
});
