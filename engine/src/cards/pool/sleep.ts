import { defineCard } from "../define.js";

// "That player's next untap step" (`tap-all`'s `untapStepOfTarget`): tied to
// the target player's untap step, so a creature that changes hands first
// untaps in its new controller's untap step as usual.
export default defineCard({
  name: "Sleep",
  manaCost: "{2}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  text: "Tap all creatures target player controls. Those creatures don't untap during that player's next untap step.",
  targets: ["player"],
  effect: {
    kind: "tap-all",
    filter: { type: "creature", controlledBy: "you" },
    controlledByTarget: 0,
    doesntUntapNext: true,
    untapStepOfTarget: true,
  },
});
