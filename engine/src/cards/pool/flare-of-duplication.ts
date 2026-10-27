import { defineCard } from "../define.js";

// Modern Horizons 3 (MH3). EDHREC rank 1136.
//
// "You may sacrifice a nontoken red creature rather than pay this spell's
// mana cost": an alternative cost (rule 118.9), the creature chosen as the
// cost is paid (601.2h). The copy is Reverberate's (rule 707.10).

export default defineCard({
  name: "Flare of Duplication",
  manaCost: "{1}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "You may sacrifice a nontoken red creature rather than pay this spell's mana cost.\nCopy target instant or sorcery spell. You may choose new targets for the copy.",
  alternativeCost: {
    mana: "{0}",
    sacrifice: { filter: { type: "creature", colors: ["R"], token: false }, text: "a nontoken red creature" },
  },
  targets: ["instant-or-sorcery-spell"],
  effect: { kind: "copy-spell", target: 0, newTargets: true },
});
