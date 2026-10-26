import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31589.

const TEXT =
  "Whenever this creature becomes blocked, it gets -1/-1 until end of turn for each creature blocking it beyond the first.";

const BEYOND_FIRST = { difference: [{ blockersOf: "source" }, 1] } as const;

export default defineCard({
  name: "Jungle Wurm",
  manaCost: "{3}{G}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Wurm"],
  power: 5,
  toughness: 5,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [],
      effect: {
        kind: "modify-pt",
        target: "source",
        power: { product: [-1, BEYOND_FIRST] },
        toughness: { product: [-1, BEYOND_FIRST] },
        duration: "end-of-turn",
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
