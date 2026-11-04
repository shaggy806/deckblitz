import { defineCard } from "../define.js";

const REMOVE = "Remove two time counters from each permanent and each suspended card.";
const PUT = "Put two time counters on each permanent with a time counter on it and each suspended card.";

export default defineCard({
  name: "Dust of Moments",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["instant"],
  text: `Choose one —\n• ${REMOVE}\n• ${PUT}`,
  castModal: {
    minModes: 1,
    maxModes: 1,
    modes: [
      { text: REMOVE, effect: { kind: "remove-counter-all", filter: {}, counter: "time", amount: 2, andSuspended: true } },
      {
        text: PUT,
        effect: {
          kind: "add-counter-all",
          filter: { counters: { kind: "time", compare: { op: "gte", n: 1 } } },
          counter: "time",
          amount: 2,
          andSuspended: true,
        },
      },
    ],
  },
});
