import { defineCard } from "../define.js";

// EDHREC rank 19730.
//
// Rulings:
//   [2024-02-02] When an effect suspects a creature, it becomes suspected. It gains menace and
//     "This creature can't block" for as long as it's suspected. It stays suspected until it
//     leaves the battlefield or another effect causes it to no longer be suspected.
//   [2024-02-02] Being suspected isn't a copiable value.
//
// "Suspect it" is the card this spell returned: slot 0 follows it onto the
// battlefield (Apprentice Necromancer's shape), and nothing is suspected if
// it never got there.

export default defineCard({
  name: "It Doesn't Add Up",
  manaCost: "{3}{B}{B}",
  colors: ["B"],
  types: ["instant"],
  text: "Return target creature card from your graveyard to the battlefield. Suspect it. (It has menace and can't block.)",
  targets: [{ kind: "card-in-graveyard", whose: "you", filter: { type: "creature" } }],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "put-onto-battlefield", target: 0 },
      { kind: "suspect", target: 0 },
    ],
  },
});
