import { defineCard } from "../define.js";

// EDHREC rank 21725.
//
// Rulings:
//   [2013-09-15] If neither creature is a legal target when Time to Feed tries to resolve, the
//     spell won't resolve and none of its effects will happen.
//   [2013-09-15] If the first target creature dies that turn, you'll gain 3 life no matter what
//     caused the creature to die or who controls the creature at that time.
//   [2013-09-15] Time to Feed has two targets: a creature an opponent controls and a creature you
//     control. If only one of those creatures is a legal target when Time to Feed tries to
//     resolve, the creatures won't fight and neither will deal or be dealt damage. If the creature
//     you don't control is the illegal target, you won't gain life when it dies.

const DIES_TEXT = "When that creature dies this turn, you gain 3 life.";

// Searing Blood's delayed "when that creature dies this turn": a slot found
// illegal is blank as this resolves, so no delayed trigger is set up for it
// (the last ruling); `fight` skips the fight when either slot is illegal.
export default defineCard({
  name: "Time to Feed",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: `Choose target creature an opponent controls. ${DIES_TEXT} Target creature you control fights that creature. (Each deals damage equal to its power to the other.)`,
  targets: ["creature-an-opponent-controls", "creature-you-control"],
  effect: {
    kind: "sequence",
    effects: [
      {
        kind: "delayed-trigger",
        at: { leaves: 0, to: ["graveyard"], thisTurn: true },
        effect: { kind: "gain-life", amount: 3 },
        text: DIES_TEXT,
      },
      { kind: "fight", a: 1, b: 0 },
    ],
  },
});
