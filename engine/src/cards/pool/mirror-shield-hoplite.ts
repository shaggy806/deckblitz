import { defineCard } from "../define.js";

// March of the Machine. "A backup ability" is a triggered ability backup is
// printed as (`abilityKeyword: "backup"`, rule 702.165a), anyone's; that
// ability is the trigger object (`objectIsTargeter`), so `copy-ability`'s
// `"trigger-ability"` copies it, as it last was on the stack if it has gone
// (rule 608.2h). The copy keeps its source, so "if that's another creature"
// still compares with the creature with backup.

const TEXT =
  "Whenever a creature you control becomes the target of a backup ability, copy that ability. You may choose new targets for the copy. This ability triggers only once each turn.";

export default defineCard({
  name: "Mirror-Shield Hoplite",
  manaCost: "{R}{W}",
  colors: ["R", "W"],
  types: ["creature"],
  subtypes: ["Human", "Soldier"],
  power: 2,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${TEXT}`,
  triggered: [
    {
      trigger: {
        on: "becomes-target",
        who: "you-control",
        filter: { type: "creature" },
        abilityKeyword: "backup",
        objectIsTargeter: true,
      },
      targets: [],
      effect: { kind: "copy-ability", target: "trigger-ability", newTargets: true },
      oncePerTurn: true,
      resolve: null,
      text: TEXT,
    },
  ],
});
