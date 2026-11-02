import { defineCard } from "../define.js";

// Rulings:
//   [2005-10-01] You choose attackers and make blocking assignments regardless
//     of whether it's your turn and regardless of whether the creatures are
//     attacking you. Your choices must be legal within the normal rules.
//   [2006-01-01] You can decide that a creature won't block.
//   [2008-04-01] With a planeswalker to attack, you choose the group; the
//     active player then chooses who or what each of them attacks.
//   [2013-09-20] With several combat phases, only before the beginning of the
//     declare attackers step of the first.
export default defineCard({
  name: "Master Warcraft",
  manaCost: "{2}{R/W}{R/W}",
  colors: ["R", "W"],
  types: ["instant"],
  text: "Cast this spell only before attackers are declared.\nYou choose which creatures attack this turn.\nYou choose which creatures block this turn and how those creatures block.",
  castOnlyIf: { kind: "before-attackers-declared" },
  effect: {
    kind: "sequence",
    effects: [
      { kind: "choose-combat", attackers: true },
      { kind: "choose-combat", blocks: "all" },
    ],
  },
});
