import { defineCard } from "../define.js";

// An intervening "if" (rule 603.4): seven or more lands as the end step
// begins and again as the ability resolves.

const SEARCH_TEXT =
  "{3}, {T}: Search your library for a basic land card, reveal it, put it into your hand, then shuffle.";
const TRANSFORM_TEXT = "At the beginning of your end step, if you control seven or more lands, transform this artifact.";

export default defineCard({
  name: "Thaumatic Compass",
  manaCost: "{2}",
  colors: [],
  types: ["artifact"],
  text: `${SEARCH_TEXT}\n${TRANSFORM_TEXT}`,
  activated: [
    {
      cost: { mana: "{3}", tap: true },
      targets: [],
      effect: {
        kind: "search-library",
        filter: { type: "land", supertype: "basic" },
        destination: "hand",
        min: 0,
        max: 1,
        reveal: true,
      },
      resolve: null,
      text: SEARCH_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "controls", filter: { type: "land" }, atLeast: 7 },
      targets: [],
      effect: { kind: "transform", target: "source" },
      resolve: null,
      text: TRANSFORM_TEXT,
    },
  ],
  faces: ["Thaumatic Compass", "Spires of Orazca"],
  transform: true,
});
