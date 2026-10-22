import { defineCard } from "../define.js";

// Ice Age (ICE). EDHREC rank 31596.
//
// Rampage's shape turned around (rule 702.23b's count): the blockers beyond
// the first are counted once, as the trigger resolves.

const TEXT =
  "Whenever this creature becomes blocked, it gets -2/-1 until end of turn for each creature blocking it beyond the first.";

const BEYOND_FIRST = { difference: [{ blockersOf: "source" }, 1] } as const;

export default defineCard({
  name: "Johtull Wurm",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 6,
  toughness: 6,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { product: [-2, BEYOND_FIRST] },
        toughness: { product: [-1, BEYOND_FIRST] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
