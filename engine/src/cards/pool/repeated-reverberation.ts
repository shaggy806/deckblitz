import { defineCard } from "../define.js";

// Commander Masters (CMM). EDHREC rank 7778.
//
// Whichever comes first this turn — an instant spell, a sorcery spell or a
// loyalty ability (rule 606.1) — is copied twice, and the delayed ability is
// used up (rule 603.7b). Only one of the two copy steps finds its object.
export default defineCard({
  name: "Repeated Reverberation",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "When you next cast an instant spell, cast a sorcery spell, or activate a loyalty ability this turn, copy that spell or ability twice. You may choose new targets for the copies.",
  effect: {
    kind: "delayed-trigger",
    at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] }, orNextAbility: { loyalty: true } },
    effect: {
      kind: "sequence",
      effects: [
        { kind: "copy-spell", target: "trigger-spell", newTargets: true, count: 2 },
        { kind: "copy-ability", target: "trigger-ability", newTargets: true, count: 2 },
      ],
    },
    text: "Copy that spell or ability twice. You may choose new targets for the copies.",
  },
});
