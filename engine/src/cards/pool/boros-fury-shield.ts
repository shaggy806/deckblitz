import { defineCard } from "../define.js";

// EDHREC rank 16892.
// Rulings:
//   [2005-10-01] If red mana was spent, Boros Fury-Shield, not the target creature, deals the
//     damage to the creature's controller.
//
// The spell is the damage's source (no `from`); the creature's power is read
// as the spell resolves.

export default defineCard({
  name: "Boros Fury-Shield",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: "Prevent all combat damage that would be dealt by target attacking or blocking creature this turn. If {R} was spent to cast this spell, Boros Fury-Shield deals damage to that creature's controller equal to the creature's power.",
  targets: ["attacking-or-blocking-creature"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage-rule", by: { target: 0 }, combat: true },
      {
        kind: "conditional",
        condition: { kind: "source", filter: { manaSpentOfColors: { R: 1 } } },
        then: { kind: "damage", amount: { powerOf: 0 }, toControllerOfTarget: 0 },
      },
    ],
  },
});
