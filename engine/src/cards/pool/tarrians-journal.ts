import { defineCard } from "../define.js";

// EDHREC rank 4145. The back face's grant is a `player-effect` `mayPlay` (Chainer's)
// with `entersWith` finality and the `becomes` rider (a `castRider` Vampire).
//
// Rulings:
//   [2023-11-10] The creature spell you cast will be a Vampire in addition to its other types
//     while on the stack. The resulting creature will be a Vampire in addition to its other types.
//   [2023-11-10] You must still follow any timing restrictions and permissions for creature spells
//     you cast with the permission granted by The Tomb of Aclazotz's last ability. Normally,
//     you'll be able to cast them only during your main phase while the stack is empty.
//   [2023-11-10] Finality counters work on any permanent, not only creatures. If a permanent with
//     a finality counter on it would be put into a graveyard from the battlefield, exile it
//     instead.
//   [2023-11-10] Multiple finality counters on a single permanent are redundant.
//   [2023-11-10] Finality counters don't stop permanents from going to zones other than the
//     graveyard from the battlefield. For example, if a permanent with a finality counter on it
//     would be put into its owner's hand from the battlefield, it does so normally.
//   [2023-11-10] You don't choose which creature spell you're casting while activating or
//     resolving The Tomb of Aclazotz's last ability. The ability creates a permission for you to
//     cast a creature spell from your graveyard later in the turn.
//   [2023-11-10] If you somehow activate The Tome of Aclazotz's ability more than once during a
//     turn, you can cast a creature spell for each ability's permission. Similarly, if another
//     effect allows you to cast a creature spell from your graveyard, you may use that permission
//     and later use The Tomb of Aclazotz's ability to cast another creature spell.
//   [2023-11-10] Finality counters aren't keyword counters, and a finality counter doesn't give
//     any abilities to the permanent it's on. If that permanent loses its abilities and then would
//     go to a graveyard, it will still be exiled instead.
//   [2023-11-10] You can discard your hand even if you hand has zero cards in it.

export default defineCard({
  name: "Tarrian's Journal",
  manaCost: "{1}{B}",
  colors: ["B"],
  supertypes: ["legendary"],
  types: ["artifact"],
  subtypes: ["Book"],
  text: "{T}, Sacrifice another artifact or creature: Draw a card. Activate only as a sorcery.\n{2}, {T}, Discard your hand: Transform Tarrian's Journal.",
  activated: [
    {
      cost: {
        mana: null,
        tap: true,
        sacrifice: { filter: { typesAnyOf: ["artifact", "creature"] } },
      },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "{T}, Sacrifice another artifact or creature: Draw a card. Activate only as a sorcery.",
      otherOnly: true,
      sorcerySpeed: true,
    },
    {
      cost: { mana: "{2}", tap: true, do: { kind: "discard-hand", who: "you" } },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: "{2}, {T}, Discard your hand: Transform Tarrian's Journal.",
    },
  ],
  faces: ["Tarrian's Journal", "The Tomb of Aclazotz"],
  transform: true,
});
