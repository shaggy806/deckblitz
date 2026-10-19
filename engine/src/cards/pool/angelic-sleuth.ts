import { defineCard } from "../define.js";

const LEAVES_TEXT =
  "Whenever another permanent you control leaves the battlefield, if it had counters on it, investigate. (Create a Clue token. It's an artifact with \"{2}, Sacrifice this token: Draw a card.\")";

// "If it had counters on it" is asked of the permanent as it last existed on
// the battlefield (rule 603.10a), any kind of counter (The Ozolith's shape).
export default defineCard({
  name: "Angelic Sleuth",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Angel", "Advisor"],
  power: 2,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${LEAVES_TEXT}`,
  triggered: [
    {
      trigger: {
        on: "leaves-battlefield",
        who: "you-control",
        otherOnly: true,
        filter: { counters: { compare: { op: "gte", n: 1 } } },
      },
      targets: [],
      effect: { kind: "create-token", token: "Clue Token", count: 1 },
      resolve: null,
      text: "Whenever another permanent you control leaves the battlefield, if it had counters on it, investigate.",
    },
  ],
});
