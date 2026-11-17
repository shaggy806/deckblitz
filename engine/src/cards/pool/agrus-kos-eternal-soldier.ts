import { defineCard } from "../define.js";

// Jumpstart 2022 (J22). EDHREC rank 12584.
//
// A `becomes-target` trigger by an ability alone (`abilityOnly`) whose every
// target is Agrus Kos (`onlyTargetingIt`), with that ability as its trigger
// object (`objectIsTargeter`), so `copy-ability`'s `"trigger-ability"` is it
// — as it last was on the stack if it has gone (rule 608.2h). The copies are
// `forEachItCouldTarget`'s (rule 707.10d): one for each other creature you
// control the ability could target, as its controller would choose, each
// aimed at its own; you control them and order them.

const TEXT =
  "Whenever Agrus Kos becomes the target of an ability that targets only it, you may pay {1}{R/W}. If you do, copy that ability for each other creature you control that ability could target. Each copy targets a different one of those creatures.";

export default defineCard({
  name: "Agrus Kos, Eternal Soldier",
  manaCost: "{3}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Spirit", "Soldier"],
  power: 3,
  toughness: 4,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT} ({R/W} can be paid with either {R} or {W}.)`,
  triggered: [
    {
      trigger: { on: "becomes-target", who: "self", abilityOnly: true, onlyTargetingIt: true, objectIsTargeter: true },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Pay {1}{R/W} to copy that ability for each other creature you control it could target?",
        cost: "{1}{R/W}",
        effect: {
          kind: "copy-ability",
          target: "trigger-ability",
          forEachItCouldTarget: { filter: { type: "creature", controlledBy: "you" }, other: true },
        },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
