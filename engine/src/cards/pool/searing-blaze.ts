import { defineCard } from "../define.js";

// The word "target" twice, so a planeswalker that's also a creature may be
// both (rule 115.3). Either target illegal, the other is still dealt its
// damage (the ruling); landfall is checked as it resolves.
const damage = (amount: number) =>
  ({
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "damage", amount, target: 0 },
      { kind: "damage", amount, target: 1 },
    ],
  }) as const;

export default defineCard({
  name: "Searing Blaze",
  manaCost: "{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Searing Blaze deals 1 damage to target player or planeswalker and 1 damage to target creature that player or that planeswalker's controller controls.\nLandfall — If you had a land enter the battlefield under your control this turn, Searing Blaze deals 3 damage to that player or planeswalker and 3 damage to that creature instead.",
  targets: [
    "player-or-planeswalker",
    { kind: "other", of: "creature", than: { slot: 0 }, sameController: true, sameObjectAllowed: true },
  ],
  effect: {
    kind: "conditional",
    condition: { kind: "turn-history", what: "entered", who: "you", filter: { type: "land" }, atLeast: 1 },
    then: damage(3),
    else: damage(1),
  },
});
