import { defineCard } from "../define.js";

// EDHREC rank 13951. Doublecast's delayed trigger, and with raid a second,
// identical one (the ruling): each copies the next instant or sorcery spell
// once, so with both that spell is copied twice.

const COPY_TEXT =
  "When you next cast an instant or sorcery spell this turn, copy that spell. You may choose new targets for the copy.";
const RAID_TEXT =
  "Raid — If you attacked this turn, when you next cast an instant or sorcery spell this turn, copy that spell an additional time. You may choose new targets for the copy.";

const delayedCopy = {
  kind: "delayed-trigger",
  at: { nextSpell: { typesAnyOf: ["instant", "sorcery"] } },
  effect: { kind: "copy-spell", target: "trigger-spell", newTargets: true },
  text: COPY_TEXT,
} as const;

export default defineCard({
  name: "Howl of the Horde",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  text: `${COPY_TEXT}\n${RAID_TEXT}`,
  targets: [],
  effect: {
    kind: "sequence",
    effects: [
      delayedCopy,
      {
        kind: "conditional",
        condition: { kind: "turn-stat", stat: "attacked", who: "you", atLeast: 1 },
        then: delayedCopy,
      },
    ],
  },
});
