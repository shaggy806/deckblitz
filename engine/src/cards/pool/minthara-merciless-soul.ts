import { defineCard } from "../define.js";
import { ward } from "../helpers.js";

// EDHREC rank 5300.
// The ward cost's X is read as the ward ability resolves (rule 608.2h), not
// as Minthara was targeted: `payGeneric`.

const WARD_TEXT = "Minthara has ward {X}, where X is the number of experience counters you have.";
const END_TEXT =
  "At the beginning of your end step, if a permanent you controlled left the battlefield this turn, you get an experience counter.";
const PT_TEXT = "Creatures you control get +1/+0 for each experience counter you have.";

export default defineCard({
  name: "Minthara, Merciless Soul",
  manaCost: "{2}{W}{B}",
  colors: ["W", "B"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Elf", "Cleric"],
  power: 2,
  toughness: 2,
  text: `${WARD_TEXT}\n${END_TEXT}\n${PT_TEXT}`,
  triggered: [
    {
      ...ward({
        payGeneric: { playerCounters: "experience" },
        text: "{X}, where X is the number of experience counters you have",
      }),
      text: WARD_TEXT,
    },
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      targets: [],
      condition: { kind: "turn-history", what: "left" },
      effect: { kind: "add-player-counters", counter: "experience", amount: 1 },
      resolve: null,
      text: END_TEXT,
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control" },
      grantPtPerCount: { playerCounters: "experience", pt: [1, 0] },
      text: PT_TEXT,
    },
  ],
});
