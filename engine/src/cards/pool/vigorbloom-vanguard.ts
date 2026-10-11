import { defineCard } from "../define.js";
import { entersPrepared, PREPARED_REMINDER } from "../helpers.js";

// A preparation card (rule 722): its prepare spell is Seed Suture, no card
// of its own.
const ENTERS_TEXT = `This creature enters prepared. ${PREPARED_REMINDER}`;
const VIGILANCE_TEXT = "Each creature you control with a +1/+1 counter on it has vigilance.";

export default defineCard({
  name: "Vigorbloom Vanguard",
  manaCost: "{1}{G/W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Troll", "Druid"],
  power: 2,
  toughness: 2,
  prepareSpell: "Seed Suture",
  text: `${ENTERS_TEXT}\n${VIGILANCE_TEXT}`,
  static: [
    entersPrepared(ENTERS_TEXT),
    {
      affects: {
        scope: "filter",
        filter: { type: "creature", controlledBy: "you", counters: { kind: "+1/+1", compare: { op: "gte", n: 1 } } },
      },
      grantKeywords: ["vigilance"],
      text: VIGILANCE_TEXT,
    },
  ],
});
