import { defineCard } from "../define.js";
import { investigate } from "../helpers.js";

// Each investigation is one (rule 701.16a): "investigate twice" is your
// first and second. Counted from the journal, so one before this arrived
// counts. The additional one is your second, and doesn't trigger it again.
const INVESTIGATE_TEXT =
  "Whenever you investigate for the first time each turn, investigate an additional time.";

export default defineCard({
  name: "Erdwal Illuminator",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Spirit"],
  power: 1,
  toughness: 3,
  keywords: ["flying"],
  text: `Flying\n${INVESTIGATE_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "investigates", who: "you", firstTimeEachTurn: true },
      targets: [],
      effect: investigate(),
      resolve: null,
      text: INVESTIGATE_TEXT,
    },
  ],
});
