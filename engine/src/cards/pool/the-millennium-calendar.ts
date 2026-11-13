import { defineCard } from "../define.js";

// EDHREC rank 4278. The first ability counts the permanents you control that
// your own untap step untapped (rule 502.3), once for the step; no player has
// priority then, so it goes on the stack as the upkeep begins (the ruling).
// The last is a state trigger (rule 603.8): it triggers again at once if it's
// countered while the counters remain. There's no "if you do": each opponent
// loses 1,000 life whether or not the Calendar was sacrificed.
//
// Rulings:
//   - If The Millenium Calendar's last ability is countered or otherwise removed from the stack,
//     it will just trigger again immediately if The Millenium Calendar still has 1,000 or more
//     time counters on it.
//   - The Millenium Calendar's first ability triggers during the untap step. However, since no
//     player gets priority during the untap step, the ability waits to be put on the stack until
//     the upkeep starts. At that time, any "beginning of upkeep" triggers will also trigger. Those
//     abilities and The Millenium Calendar's ability are put onto the stack at that time.

const UNTAP_TEXT =
  "Whenever you untap one or more permanents during your untap step, put that many time counters on The Millennium Calendar.";
const DOUBLE_TEXT = "{2}, {T}: Double the number of time counters on The Millennium Calendar.";
const END_TEXT =
  "When there are 1,000 or more time counters on The Millennium Calendar, sacrifice it and each opponent loses 1,000 life.";

export default defineCard({
  name: "The Millennium Calendar",
  manaCost: "{1}",
  colors: [],
  supertypes: ["legendary"],
  types: ["artifact"],
  text: `${UNTAP_TEXT}\n${DOUBLE_TEXT}\n${END_TEXT}`,
  triggered: [
    {
      trigger: { on: "event", event: "untaps-in-untap-step", who: "you" },
      targets: [],
      effect: { kind: "add-counter", target: "source", counter: "time", amount: { triggerValue: true } },
      resolve: null,
      text: UNTAP_TEXT,
    },
    {
      trigger: { on: "state", state: { kind: "self-counters", counter: "time", compare: { op: "gte", n: 1000 } } },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "sacrifice-source" }, { kind: "lose-life", amount: 1000, who: "each-opponent" }],
      },
      resolve: null,
      text: END_TEXT,
    },
  ],
  activated: [
    {
      cost: { mana: "{2}", tap: true },
      targets: [],
      effect: { kind: "double-counters", target: "source", counter: "time" },
      resolve: null,
      text: DOUBLE_TEXT,
    },
  ],
});
