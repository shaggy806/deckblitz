import { defineCard } from "../define.js";

// Rulings:
//   Gather Specimens won't retroactively change the control of creatures that have already entered
//     that turn.
//   Some effects that put creatures onto the battlefield continue to affect those creatures later
//     on. Although Gather Specimens changes whose control the creature enters under, the rest of
//     the effect works as normal. (Unearth: the creature has haste, it's exiled at the beginning of
//     the end step, and exiled if it would leave the battlefield.)
//   If the effect that puts a creature onto the battlefield also creates a delayed triggered
//     ability, Gather Specimens doesn't change who controls that ability.
//   The Gather Specimens replacement effect is applied before any other replacement effects that
//     would also modify how the creature enters (devour, Voice of All's color, Clone's choice: you
//     choose them as it enters under your control).
//   Gather Specimens isn't targeted. It affects creatures that would enter under any opponent's
//     control.
//   If two or more players have each cast Gather Specimens during the same turn and a creature
//     would enter, the creature's would-be controller chooses one of the applicable Gather
//     Specimens to apply, then the new would-be controller repeats this among the remaining ones.
//   If a creature spell controlled by an opponent would resolve, it resolves, but the creature
//     enters under your control instead. Choices made when casting that spell are remembered.
//   Gather Specimens affects both token creatures and nontoken creatures, entering by any means.
//   If two opposing players have each cast Gather Specimens during the same turn and a creature
//     would enter under the control of one of them, it really will enter under that player's
//     control.

// A resolved `others-enter-battlefield` replacement for the turn (rule
// 611.2c), applied first of everything on how a permanent enters
// (`Game.enteringUnder`), each Gather Specimens once (rule 614.5).
export default defineCard({
  name: "Gather Specimens",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  types: ["instant"],
  text: "If a creature would enter the battlefield under an opponent's control this turn, it enters under your control instead.",
  targets: [],
  effect: {
    kind: "replacement-effect",
    duration: "end-of-turn",
    replacement: { event: "others-enter-battlefield", filter: { type: "creature", controlledBy: "opponent" }, underYou: true },
  },
});
