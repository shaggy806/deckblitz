import { defineCard } from "../define.js";

// EDHREC rank 5800.
//
// String of Disappearances' and Chain of Plasma's shape: "that player or that
// permanent's controller" is the targeted player, or whoever controlled the
// targeted permanent as it last existed (rule 608.2h). The copy is theirs to
// make, aim and control, so its own chain may go on.
//
// Rulings:
//   [2022-12-08] The copy of Chain Lightning is created on the stack, so it's not cast.
//   [2022-12-08] The player putting the copy of the spell on the stack controls that copy.
//   [2022-12-08] If the targeted player or permanent is an illegal target as Chain Lightning tries
//     to resolve, the spell doesn't resolve and none of its effects happen. It can't be copied.

const TEXT =
  "Chain Lightning deals 3 damage to any target. Then that player or that permanent's controller may pay {R}{R}. If the player does, they may copy this spell and may choose a new target for that copy.";

export default defineCard({
  name: "Chain Lightning",
  manaCost: "{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: TEXT,
  targets: ["any-target"],
  effect: {
    kind: "sequence",
    effects: [
      { kind: "damage", amount: 3, target: 0 },
      {
        kind: "each-player-may",
        who: { controllerOfTarget: 0 },
        options: [{ pay: "{R}{R}", text: "Pay {R}{R}" }],
        ifDid: {
          kind: "each-player-may",
          who: "that-player",
          prompt: "Copy Chain Lightning? (You may choose a new target for the copy.)",
          effect: { kind: "copy-spell", target: "source", newTargets: true },
        },
      },
    ],
  },
});
